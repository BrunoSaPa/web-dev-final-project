import { connectToDatabase } from '../mongodb.js';
import Species from '../models/Species.js';

export async function getSpecies(params = {}) {
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

        let query = {};

        // Status filter
        if (status) query.categoria_lista_roja = status;

        // Search filter
        if (search) {
            query.$or = [
                { nombre_cientifico: { $regex: search, $options: 'i' } },
                { nombre_comun: { $regex: search, $options: 'i' } }
            ];
        }

        // Location filter
        if (estado) query.top_lugares = { $regex: estado, $options: 'i' };

        // Taxonomy filters
        if (reino) query.reino = reino;
        if (filo) query.filo = filo;
        if (clase) query.clase = clase;
        if (orden) query.orden = orden;
        if (familia) query.familia = familia;

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const totalItems = await Species.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limitNum);

        const species = await Species.find(query)
            .limit(limitNum)
            .skip(skip)
            .lean();

        // Transform _id to string for serialization
        const serializedSpecies = species.map(s => ({
            ...s,
            _id: s._id.toString(),
            createdAt: s.createdAt ? s.createdAt.toISOString() : null,
            updatedAt: s.updatedAt ? s.updatedAt.toISOString() : null
        }));

        return {
            success: true,
            species: serializedSpecies,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalItems,
                totalPages
            }
        };
    } catch (error) {
        console.error('Error in getSpecies controller:', error);
        // Return empty result instead of throwing to allow page to render
        return {
            success: false,
            species: [],
            pagination: {
                page: 1,
                limit: parseInt(params.limit || 15),
                totalItems: 0,
                totalPages: 0
            }
        };
    }
}
