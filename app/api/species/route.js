import { connectToDatabase } from '../../../lib/mongodb';
import Species from '../../../lib/models/Species';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const statusParam = searchParams.get('status');
    const status = statusParam && statusParam.trim() !== '' ? statusParam : null;
    const search = searchParams.get('search') || null;
    const estado = searchParams.get('estado') || null;
    const reino = searchParams.get('reino') || null;
    const filo = searchParams.get('filo') || null;
    const clase = searchParams.get('clase') || null;
    const orden = searchParams.get('orden') || null;
    const familia = searchParams.get('familia') || null;

    try {
        await connectToDatabase();

        // Build query filter with proper AND/OR logic
        let query = {};
        let andConditions = [];
        
        // Status filter
        if (status && status !== '') {
            andConditions.push({ categoria_lista_roja: status });
        }
        
        // Estado (location) filter - search in top_lugares field
        if (estado && estado !== '') {
            const estadoNormalized = estado.toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
            andConditions.push({ top_lugares: { $regex: estadoNormalized, $options: 'i' } });
        }
        
        // Taxonomy filters - each one gets its own OR condition
        if (reino && reino !== '') {
            andConditions.push({
                $or: [
                    { reino: reino },
                    { json_completo: { $regex: `"reino"\\s*:\\s*"${reino}"`, $options: 'i' } }
                ]
            });
        }
        if (filo && filo !== '') {
            andConditions.push({
                $or: [
                    { filo: filo },
                    { json_completo: { $regex: `"filo"\\s*:\\s*"${filo}"`, $options: 'i' } }
                ]
            });
        }
        if (clase && clase !== '') {
            andConditions.push({
                $or: [
                    { clase: clase },
                    { json_completo: { $regex: `"clase"\\s*:\\s*"${clase}"`, $options: 'i' } }
                ]
            });
        }
        if (orden && orden !== '') {
            andConditions.push({
                $or: [
                    { orden: orden },
                    { json_completo: { $regex: `"orden"\\s*:\\s*"${orden}"`, $options: 'i' } }
                ]
            });
        }
        if (familia && familia !== '') {
            andConditions.push({
                $or: [
                    { familia: familia },
                    { json_completo: { $regex: `"familia"\\s*:\\s*"${familia}"`, $options: 'i' } }
                ]
            });
        }
        
        // Search filter (searches both scientific and common names)
        if (search && search !== '') {
            andConditions.push({
                $or: [
                    { nombre_cientifico: { $regex: search, $options: 'i' } },
                    { nombre_comun: { $regex: search, $options: 'i' } }
                ]
            });
        }
        
        // Build final query using $and for all conditions
        if (andConditions.length > 0) {
            if (andConditions.length === 1) {
                query = andConditions[0];
            } else {
                query.$and = andConditions;
            }
        }

        // Get total count for pagination
        const totalItems = await Species.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const currentPage = Math.min(Math.max(1, page), totalPages);

        // Calculate skip
        const skip = (currentPage - 1) * limit;

        // Fetch species with pagination
        const species = await Species.find(query)
            .skip(skip)
            .limit(limit)
            .lean();

        // Transform data to match expected format
        const transformedSpecies = species.map((s) => {
            // Usar foto_1 si existe, sino usar foto_principal, sino usar imagen por defecto
            let imagen = '/images/default.png';
            if (s.foto_1) {
                imagen = s.foto_1;
            } else if (s.foto_principal) {
                imagen = s.foto_principal;
            }

            // Extract taxonomy from json_completo
            let taxonomy = {};
            if (s.json_completo) {
                try {
                    const jsonData = JSON.parse(s.json_completo);
                    if (jsonData.taxonomia) {
                        taxonomy = {
                            reino: jsonData.taxonomia.reino,
                            filo: jsonData.taxonomia.filo,
                            clase: jsonData.taxonomia.clase,
                            orden: jsonData.taxonomia.orden,
                            familia: jsonData.taxonomia.familia,
                        };
                    }
                } catch (e) {
                    // Silently skip if JSON parse fails
                }
            }

            // Extract states from top_lugares
            let estados = [];
            if (s.top_lugares) {
                try {
                    const lugares = JSON.parse(s.top_lugares);
                    const stateSet = new Set();
                    lugares.forEach(lugar => {
                        const match = lugar.match(/^([^(]+)/);
                        if (match) {
                            let state = match[1].trim();
                            // Normalize state names
                            state = state.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
                            state = state.toLowerCase();
                            stateSet.add(state);
                        }
                    });
                    estados = Array.from(stateSet).sort();
                } catch (e) {
                    // Silently skip if JSON parse fails
                }
            }

            return {
                _id: s._id,
                nombre_cientifico: s.nombre_cientifico,
                nombre_comun: s.nombre_comun,
                scientificName: s.nombre_cientifico,
                commonName: s.nombre_comun,
                statusLabel: s.categoria_lista_roja,
                categoria_lista_roja: s.categoria_lista_roja,
                image: imagen,
                fotos: s.fotos || [],
                descripcion: s.descripcion || '',
                ...taxonomy,
                estados,
            };
        });

        return Response.json({
            success: true,
            species: transformedSpecies,
            pagination: {
                page: currentPage,
                totalPages,
                limit,
                status: status && status !== '' ? status : null,
                totalItems,
            },
        });
    } catch (error) {
        console.error('Error fetching species:', error);
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
