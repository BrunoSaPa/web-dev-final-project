import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './lib/mongodb-express.js';
import Species from './lib/models/Species-express.js';

const app = express();
const PORT = process.env.EXPRESS_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Species routes
app.get('/api/species', async (req, res) => {
    console.log('Received /api/species request with query:', req.query);
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
        familia,
        added_by,
        state
    } = req.query;

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
        
        // Search filter
        if (search && search !== '') {
            andConditions.push({
                $or: [
                    { nombre_cientifico: { $regex: search, $options: 'i' } },
                    { nombre_comun: { $regex: search, $options: 'i' } }
                ]
            });
        }

        if (added_by && added_by !== '') {
            andConditions.push({ added_by: added_by });
        }

        // State filter (for admin panel)
        if (state && state !== '') {
            andConditions.push({ state: state });
        }
        
        // Build final query using $and for all conditions
        if (andConditions.length > 0) {
            query = { $and: andConditions };
        }

        // Build final query using $and for all conditions
        if (andConditions.length > 0) {
            if (andConditions.length === 1) {
                query = andConditions[0];
            } else {
                query.$and = andConditions;
            }
        }

        // Also filter by approved state unless explicitly requesting pending/rejected
        if (!state || state === '') {
            // Default to approved species only, but also include legacy documents without state
            const approvedCondition = { 
                $or: [
                    { state: 'approved' },
                    { state: { $exists: false } },
                    { state: null }
                ]
            };

            if (Object.keys(query).length > 0) {
                if (query.$and) {
                    query.$and.push(approvedCondition);
                } else {
                    query = { $and: [query, approvedCondition] };
                }
            } else {
                query = approvedCondition;
            }
        }

        // Get total count for pagination
        const totalItems = await Species.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(totalItems / parseInt(limit)));
        const currentPage = Math.min(Math.max(1, parseInt(page)), totalPages);

        // Calculate skip
        const skip = (currentPage - 1) * parseInt(limit);

        // Fetch species with pagination
        const species = await Species.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Transform data to match expected format
        const transformedSpecies = species.map((s) => {
            let imagen = '/images/default.png';
            if (s.foto_1) {
                imagen = s.foto_1;
            } else if (s.foto_principal) {
                imagen = s.foto_principal;
            }

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
                    // Skip parse errors
                }
            }

            let estados = [];
            if (s.top_lugares) {
                try {
                    const lugares = JSON.parse(s.top_lugares);
                    const stateSet = new Set();
                    lugares.forEach(lugar => {
                        const match = lugar.match(/^([^(]+)/);
                        if (match) {
                            let state = match[1].trim();
                            state = state.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
                            state = state.toLowerCase();
                            stateSet.add(state);
                        }
                    });
                    estados = Array.from(stateSet).sort();
                } catch (e) {
                    // Skip parse errors
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
                json_completo: s.json_completo,
                top_lugares: s.top_lugares,
                inat_id: s.inat_id,
                gbif_id: s.gbif_id,
                id_taxon_sis: s.id_taxon_sis,
                foto_principal: s.foto_principal,
                foto_1: s.foto_1,
                foto_2: s.foto_2,
                foto_3: s.foto_3,
                foto_4: s.foto_4,
                added_by: s.added_by,
                state: s.state,
                createdAt: s.createdAt
            };
        });

        res.json({
            success: true,
            species: transformedSpecies,
            pagination: {
                page: currentPage,
                totalPages,
                limit: parseInt(limit),
                status: status && status !== '' ? status : null,
                totalItems,
            },
        });
    } catch (error) {
        console.error('Error fetching species:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.post('/api/species', async (req, res) => {
    try {
        await connectToDatabase();

        const speciesData = req.body;
        
        // Validate required fields
        const requiredFields = ['nombre_cientifico', 'added_by'];
        const missingFields = requiredFields.filter(field => !speciesData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Check for duplicate scientific name
        const existingSpecies = await Species.findOne({ 
            nombre_cientifico: speciesData.nombre_cientifico 
        });
        
        if (existingSpecies) {
            return res.status(409).json({ 
                error: 'Species with this scientific name already exists',
                field: 'nombre_cientifico'
            });
        }

        // Create new species with proper defaults
        const newSpecies = new Species({
            nombre_cientifico: speciesData.nombre_cientifico,
            nombre_comun: speciesData.nombre_comun || '',
            categoria_lista_roja: speciesData.categoria_lista_roja || 'Not Assessed',
            descripcion: speciesData.descripcion || '',
            foto_principal: speciesData.foto_principal || '/images/default.png',
            fotos: speciesData.fotos || [],
            id_taxon_sis: speciesData.id_taxon_sis || null,
            inat_id: speciesData.inat_id || null,
            gbif_id: speciesData.gbif_id || null,
            top_lugares: speciesData.top_lugares || '',
            added_by: speciesData.added_by,
            state: speciesData.state || 'pending'
        });

        const savedSpecies = await newSpecies.save();

        res.status(201).json({
            success: true,
            species: savedSpecies,
            message: 'Species contribution submitted successfully'
        });
    } catch (error) {
        console.error('Error creating species:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: Object.values(error.errors).map(err => err.message) 
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

// Species filters route
app.get('/api/species/filters', async (req, res) => {
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
                        const jsonData = JSON.parse(species.json_completo);
                        if (jsonData.reino) taxData.reino.add(jsonData.reino);
                        if (jsonData.filo) taxData.filo.add(jsonData.filo);
                        if (jsonData.clase) taxData.clase.add(jsonData.clase);
                        if (jsonData.orden) taxData.orden.add(jsonData.orden);
                        if (jsonData.familia) taxData.familia.add(jsonData.familia);
                    } catch (e) {
                        // Skip invalid JSON
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

        // For estados, we need to extract from top_lugares
        let estadosSet = new Set();
        
        // List of valid Mexican states
        const validStates = [
            'aguascalientes', 'baja california', 'baja california sur', 'campeche', 'coahuila',
            'colima', 'chiapas', 'chihuahua', 'durango', 'guanajuato', 'guerrero', 'hidalgo',
            'jalisco', 'mexico', 'michoacan', 'morelos', 'nayarit', 'nuevo leon', 'oaxaca',
            'puebla', 'queretaro', 'quintana roo', 'san luis potosi', 'sinaloa', 'sonora',
            'tabasco', 'tamaulipas', 'tlaxcala', 'veracruz', 'yucatan', 'zacatecas'
        ];
        
        // Parse from all documents to extract estados
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

        res.json({
            estados: Array.from(estadosSet).sort(),
            reino: cleanArray(reinos.length > 0 ? reinos : Array.from(taxData.reino)),
            filo: cleanArray(filos.length > 0 ? filos : Array.from(taxData.filo)),
            clase: cleanArray(clases.length > 0 ? clases : Array.from(taxData.clase)),
            orden: cleanArray(ordenes.length > 0 ? ordenes : Array.from(taxData.orden)),
            familia: cleanArray(familias.length > 0 ? familias : Array.from(taxData.familia)),
            status: cleanArray(statuses),
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.get('/api/admin/check', async (req, res) => {
    try {
        res.json({ isAdmin: false });
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.json({ isAdmin: false });
    }
});

app.post('/api/admin/approve', async (req, res) => {
    try {
        await connectToDatabase();
        
        const { speciesId, action } = req.body;
        
        // Validate input
        if (!speciesId || !action || !['approved', 'rejected'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid species ID or action'
            });
        }
        
        // Find and update the species
        const species = await Species.findById(speciesId);
        if (!species) {
            return res.status(404).json({
                success: false,
                error: 'Species not found'
            });
        }
        
        species.state = action;
        await species.save();
        
        res.json({
            success: true,
            message: `Species ${action} successfully`,
            species
        });
        
    } catch (error) {
        console.error('Error in admin approve:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Express server is working!', mongoUri: process.env.MONGODB_URI ? 'Connected' : 'Not found' });
});

// Contact route
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, comment } = req.body;
        console.log('Contact form submission:', { name, email, comment });
        res.json({ success: true, name });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, error: 'Failed to process request' });
    }
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', () => {
    console.log('Server shutting down...');
    process.exit(0);
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Express server running on http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB URI available: ${!!process.env.MONGODB_URI}`);
    console.log(`Process ID: ${process.pid}`);
});

export default app;