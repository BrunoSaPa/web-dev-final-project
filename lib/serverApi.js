// Server-side API helper - directly queries MongoDB
import { connectToDatabase } from '@/lib/mongodb-express';
import Species from '@/lib/models/Species-express';

export async function getSpeciesServerSide(params = {}) {
    try {
        await connectToDatabase();

        const {
            page = 1,
            limit = 15,
            status,
            search,
            estado,
            reino,
            filo,
            clase,
            orden,
            familia
        } = params;

        // Build query
        let query = {};
        if (status) query.categoria_lista_roja = status;
        if (search) {
            query.$or = [
                { nombre_cientifico: { $regex: search, $options: 'i' } },
                { nombre_comun: { $regex: search, $options: 'i' } }
            ];
        }
        if (estado) query.top_lugares = { $regex: estado, $options: 'i' };
        if (reino) query.reino = reino;
        if (filo) query.filo = filo;
        if (clase) query.clase = clase;
        if (orden) query.orden = orden;
        if (familia) query.familia = familia;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Species.countDocuments(query);

        // Fetch species
        const species = await Species.find(query)
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Convert to plain JSON to avoid serialization issues with Next.js
        const plainSpecies = JSON.parse(JSON.stringify(species));

        return {
            species: plainSpecies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        };
    } catch (error) {
        console.error('Error fetching species (server-side):', error);
        return {
            species: [],
            pagination: { page: 1, limit: 15, total: 0, pages: 0 },
            error: error.message
        };
    }
}

export async function getSpeciesFilterOptionsServerSide() {
    try {
        await connectToDatabase();

        const [reinos, filos, clases, ordenes, familias, estados, categorias] = await Promise.all([
            Species.distinct('reino'),
            Species.distinct('filo'),
            Species.distinct('clase'),
            Species.distinct('orden'),
            Species.distinct('familia'),
            Species.distinct('top_lugares'),
            Species.distinct('categoria_lista_roja')
        ]);

        return {
            reino: reinos.filter(Boolean).sort(),
            filo: filos.filter(Boolean).sort(),
            clase: clases.filter(Boolean).sort(),
            orden: ordenes.filter(Boolean).sort(),
            familia: familias.filter(Boolean).sort(),
            estado: estados.filter(Boolean).sort(),
            estado_conservacion: categorias.filter(Boolean).sort()
        };
    } catch (error) {
        console.error('Error fetching filter options (server-side):', error);
        return {
            reino: [],
            filo: [],
            clase: [],
            orden: [],
            familia: [],
            estado: [],
            estado_conservacion: []
        };
    }
}
