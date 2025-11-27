import { connectToDatabase } from '@/lib/mongodb';
import Species from '@/lib/models/Species';

export async function GET() {
    try {
        await connectToDatabase();

        // Get unique values for each filter
        const [reinos, filos, clases, ordenes, familias, statuses] = await Promise.all([
            Species.distinct('reino'),
            Species.distinct('filo'),
            Species.distinct('clase'),
            Species.distinct('orden'),
            Species.distinct('familia'),
            Species.distinct('categoria_lista_roja'),
        ]);
        
        // If taxonomy fields are empty, extract from json_completo
        let taxData = {
            reino: new Set(),
            filo: new Set(),
            clase: new Set(),
            orden: new Set(),
            familia: new Set()
        };
        
        if (!reinos || reinos.length === 0) {
            // Extract from json_completo
            const allSpecies = await Species.find({}).select({ json_completo: 1 }).lean();
            allSpecies.forEach(species => {
                if (species.json_completo) {
                    try {
                        const data = JSON.parse(species.json_completo);
                        if (data.taxonomia) {
                            if (data.taxonomia.reino) taxData.reino.add(data.taxonomia.reino);
                            if (data.taxonomia.filo) taxData.filo.add(data.taxonomia.filo);
                            if (data.taxonomia.clase) taxData.clase.add(data.taxonomia.clase);
                            if (data.taxonomia.orden) taxData.orden.add(data.taxonomia.orden);
                            if (data.taxonomia.familia) taxData.familia.add(data.taxonomia.familia);
                        }
                    } catch (e) {
                        // Skip parse errors
                    }
                }
            });
        }

        // Clean and sort values
        const cleanArray = (arr) => {
            return arr
                .filter(v => v && v !== null && v !== '')
                .map(v => String(v).trim())
                .sort();
        };

        // For estados, we need to extract from top_lugares if not in distinct
        let estadosSet = new Set();
        
        // List of valid Mexican states
        const validStates = [
            'aguascalientes', 'baja california', 'baja california sur', 'campeche', 'coahuila',
            'colima', 'chiapas', 'chihuahua', 'durango', 'guanajuato', 'guerrero', 'hidalgo',
            'jalisco', 'mexico', 'michoacan', 'morelos', 'nayarit', 'nuevo leon', 'oaxaca',
            'puebla', 'queretaro', 'quintana roo', 'san luis potosi', 'sinaloa', 'sonora',
            'tabasco', 'tamaulipas', 'tlaxcala', 'veracruz', 'yucatan', 'zacatecas'
        ];
        
        // Always parse from all documents because estados field may not be set
        const docs = await Species.find({}).select({ top_lugares: 1 }).lean();
        docs.forEach(doc => {
            if (doc.top_lugares) {
                try {
                    const lugares = JSON.parse(doc.top_lugares);
                    lugares.forEach(lugar => {
                        const match = lugar.match(/^([^(]+)/);
                        if (match) {
                            let state = match[1].trim();
                            // Normalize state names: remove accents, lowercase
                            state = state.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/[,.]$/g, '').trim();
                            state = state.toLowerCase();
                            
                            // Check if it matches a valid state name (exact or partial)
                            const isValidState = validStates.some(validState => 
                                state === validState || state.includes(validState) || validState.includes(state)
                            );
                            
                            if (isValidState) {
                                // Find the actual state name to use
                                const matchedState = validStates.find(validState => 
                                    state === validState || state.includes(validState) || validState.includes(state)
                                );
                                if (matchedState) {
                                    estadosSet.add(matchedState);
                                }
                            }
                        }
                    });
                } catch (e) {
                    // Skip parse errors
                }
            }
        });

        return Response.json({
            estados: Array.from(estadosSet).sort(),
            reino: cleanArray(reinos.length > 0 ? reinos : Array.from(taxData.reino)),
            filo: cleanArray(filos.length > 0 ? filos : Array.from(taxData.filo)),
            clase: cleanArray(clases.length > 0 ? clases : Array.from(taxData.clase)),
            orden: cleanArray(ordenes.length > 0 ? ordenes : Array.from(taxData.orden)),
            familia: cleanArray(familias.length > 0 ? familias : Array.from(taxData.familia)),
            status: cleanArray(statuses),
        });
    } catch (error) {
        console.error('Error fetching filter values:', error);
        return Response.json(
            { error: 'Failed to fetch filter values' },
            { status: 500 }
        );
    }
}
