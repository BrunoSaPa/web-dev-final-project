// Load environment variables from .env file
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './lib/mongodb-express.js';
import Species from './lib/models/Species-express.js';

// Initialize Express application
const app = express();
// Port for Express server (separate from Next.js frontend on port 3000)
const PORT = process.env.EXPRESS_PORT || 3001;

// Enable CORS to allow requests from Next.js frontend
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// GET /api/species - Retrieve species with advanced filtering and pagination
app.get('/api/species', async (req, res) => {
    console.log('Received /api/species request with query:', req.query);
    // Extract query parameters for filtering and pagination
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
        // Establish connection to MongoDB
        await connectToDatabase();

        // Initialize query builder with AND conditions for all filters
        let query = {};
        let andConditions = [];
        
        // Status filter (Red List category)
        if (status && status !== '') {
            andConditions.push({ categoria_lista_roja: status });
        }
        
        // Estado (location state) filter - search in top_lugares field
        if (estado && estado !== '') {
            // Normalize input: remove accents to match stored data
            const estadoNormalized = estado.toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
            andConditions.push({ top_lugares: { $regex: estadoNormalized, $options: 'i' } });
        }
        
        // Taxonomy filters - check both dedicated fields and json_completo field
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
        
        // Text search filter - search by scientific or common name
        if (search && search !== '') {
            andConditions.push({
                $or: [
                    { nombre_cientifico: { $regex: search, $options: 'i' } },
                    { nombre_comun: { $regex: search, $options: 'i' } }
                ]
            });
        }
        
        // Filter by user who submitted the species
        if (added_by && added_by !== '') {
            andConditions.push({ added_by: added_by });
        }

        // Filter by approval state (admin panel usage)
        if (state && state !== '') {
            andConditions.push({ state: state });
        }
        
        // Combine all conditions with AND operator
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
            // Include approved species and legacy documents without state field
            const approvedCondition = { 
                $or: [
                    { state: 'approved' },
                    { state: { $exists: false } },
                    { state: null }
                ]
            };

            // Add approval filter to existing query
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

        // Get total count of matching documents for pagination calculations
        const totalItems = await Species.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(totalItems / parseInt(limit)));
        // Ensure current page doesn't exceed total pages
        const currentPage = Math.min(Math.max(1, parseInt(page)), totalPages);

        // Calculate how many documents to skip for the requested page
        const skip = (currentPage - 1) * parseInt(limit);

        // Fetch species with pagination
        const species = await Species.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Transform data to match expected frontend format
        const transformedSpecies = species.map((s) => {
            // Set default image or use provided ones
            let imagen = '/images/default.png';
            if (s.foto_1) {
                imagen = s.foto_1;
            } else if (s.foto_principal) {
                imagen = s.foto_principal;
            }

            // Extract taxonomy information from document
            let taxonomy = {};
            let category = s.categoria_lista_roja;

            // Parse JSON data for taxonomy and category fallback
            if (s.json_completo) {
                try {
                    const jsonData = JSON.parse(s.json_completo);
                    
                    // Use JSON data as fallback if category not in main fields
                    if (!category && jsonData.categoria_lista_roja) {
                        category = jsonData.categoria_lista_roja;
                    }

                    // Extract taxonomy hierarchy from JSON
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
                    // Silently handle parse errors - malformed JSON won't crash request
                }
            }

            // Extract and normalize Mexican state names from locations
            let estados = [];
            if (s.top_lugares) {
                try {
                    const lugares = JSON.parse(s.top_lugares);
                    const stateSet = new Set();
                    lugares.forEach(lugar => {
                        // Extract state name before parentheses
                        const match = lugar.match(/^([^(]+)/);
                        if (match) {
                            let state = match[1].trim();
                            // Normalize: remove accents and convert to lowercase
                            state = state.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
                            state = state.toLowerCase();
                            stateSet.add(state);
                        }
                    });
                    // Return unique, sorted states
                    estados = Array.from(stateSet).sort();
                } catch (e) {
                    // Silently handle parse errors
                }
            }

            // Return formatted species object for frontend
            return {
                _id: s._id,
                nombre_cientifico: s.nombre_cientifico,
                nombre_comun: s.nombre_comun,
                scientificName: s.nombre_cientifico,
                commonName: s.nombre_comun,
                statusLabel: category || 'Not Assessed',
                categoria_lista_roja: category || 'Not Assessed',
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

        // Send paginated results with metadata
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
        // Connect to MongoDB
        await connectToDatabase();

        // Extract species data from request body
        const speciesData = req.body;
        
        // Define which fields are required for a valid submission
        const requiredFields = ['nombre_cientifico', 'added_by'];
        const missingFields = requiredFields.filter(field => !speciesData[field]);
        
        // Return error if required fields are missing
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Check if species with same scientific name already exists (prevent duplicates)
        const existingSpecies = await Species.findOne({ 
            nombre_cientifico: speciesData.nombre_cientifico 
        });
        
        if (existingSpecies) {
            return res.status(409).json({ 
                error: 'Species with this scientific name already exists',
                field: 'nombre_cientifico'
            });
        }

        // Create new species document with defaults for optional fields
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
            // New species submissions start as pending approval
            state: speciesData.state || 'pending'
        });

        // Save to database
        const savedSpecies = await newSpecies.save();

        // Return success response with created species
        res.status(201).json({
            success: true,
            species: savedSpecies,
            message: 'Species contribution submitted successfully'
        });
    } catch (error) {
        console.error('Error creating species:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: Object.values(error.errors).map(err => err.message) 
            });
        }
        
        // Handle other errors
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

// GET /api/species/filters - Retrieve all available filter options
app.get('/api/species/filters', async (req, res) => {
    try {
        // Connect to MongoDB
        await connectToDatabase();

        // Get unique values for each taxonomy and category filter
        const [reinos, filos, clases, ordenes, familias, statuses] = await Promise.all([
            Species.distinct('reino'),
            Species.distinct('filo'),
            Species.distinct('clase'),
            Species.distinct('orden'),
            Species.distinct('familia'),
            Species.distinct('categoria_lista_roja'),
        ]);
        
        // Always try to get taxonomy data from actual documents, not just distinct
        let taxData = {
            reino: new Set(),
            filo: new Set(),
            clase: new Set(),
            orden: new Set(),
            familia: new Set()
        };
        
        // Get all species to extract taxonomy values (in case fields are empty strings)
        const allSpecies = await Species.find({}).select({ reino: 1, filo: 1, clase: 1, orden: 1, familia: 1, json_completo: 1 }).lean();
        allSpecies.forEach(species => {
            // Try main fields first
            if (species.reino && species.reino.trim()) taxData.reino.add(species.reino.trim());
            if (species.filo && species.filo.trim()) taxData.filo.add(species.filo.trim());
            if (species.clase && species.clase.trim()) taxData.clase.add(species.clase.trim());
            if (species.orden && species.orden.trim()) taxData.orden.add(species.orden.trim());
            if (species.familia && species.familia.trim()) taxData.familia.add(species.familia.trim());
            
            // Fallback to JSON data if main fields are empty
            if (species.json_completo) {
                try {
                    const jsonData = JSON.parse(species.json_completo);
                    if (jsonData.taxonomia) {
                        if (jsonData.taxonomia.reino && !taxData.reino.has(jsonData.taxonomia.reino.trim())) {
                            taxData.reino.add(jsonData.taxonomia.reino.trim());
                        }
                        if (jsonData.taxonomia.filo && !taxData.filo.has(jsonData.taxonomia.filo.trim())) {
                            taxData.filo.add(jsonData.taxonomia.filo.trim());
                        }
                        if (jsonData.taxonomia.clase && !taxData.clase.has(jsonData.taxonomia.clase.trim())) {
                            taxData.clase.add(jsonData.taxonomia.clase.trim());
                        }
                        if (jsonData.taxonomia.orden && !taxData.orden.has(jsonData.taxonomia.orden.trim())) {
                            taxData.orden.add(jsonData.taxonomia.orden.trim());
                        }
                        if (jsonData.taxonomia.familia && !taxData.familia.has(jsonData.taxonomia.familia.trim())) {
                            taxData.familia.add(jsonData.taxonomia.familia.trim());
                        }
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        });

        // Helper function to clean and sort filter arrays
        const cleanArray = (arr) => {
            return arr
                .filter(v => v && v !== null && v !== '')
                .map(v => String(v).trim())
                .sort();
        };

        // Extract states from species locations (top_lugares field)
        let estadosSet = new Set();
        
        // List of all valid Mexican states for validation
        const validStates = [
            'aguascalientes', 'baja california', 'baja california sur', 'campeche', 'coahuila',
            'colima', 'chiapas', 'chihuahua', 'durango', 'guanajuato', 'guerrero', 'hidalgo',
            'jalisco', 'mexico', 'michoacan', 'morelos', 'nayarit', 'nuevo leon', 'oaxaca',
            'puebla', 'queretaro', 'quintana roo', 'san luis potosi', 'sinaloa', 'sonora',
            'tabasco', 'tamaulipas', 'tlaxcala', 'veracruz', 'yucatan', 'zacatecas'
        ];
        
        // Parse locations from all documents to extract state names
        const docs = await Species.find({}).select({ top_lugares: 1 }).lean();
        docs.forEach(doc => {
            if (doc.top_lugares) {
                try {
                    const lugares = JSON.parse(doc.top_lugares);
                    lugares.forEach(lugar => {
                        // Extract state name before parentheses
                        const match = lugar.match(/^([^(]+)/);
                        if (match) {
                            let state = match[1].trim();
                            // Normalize: remove accents and convert to lowercase
                            state = state.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/[,.]$/g, '').trim();
                            state = state.toLowerCase();
                            
                            // Validate against known Mexican states
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

        // Return all filter options in consistent format
        res.json({
            estados: Array.from(estadosSet).sort(),
            reino: cleanArray(taxData.reino.size > 0 ? Array.from(taxData.reino) : reinos),
            filo: cleanArray(taxData.filo.size > 0 ? Array.from(taxData.filo) : filos),
            clase: cleanArray(taxData.clase.size > 0 ? Array.from(taxData.clase) : clases),
            orden: cleanArray(taxData.orden.size > 0 ? Array.from(taxData.orden) : ordenes),
            familia: cleanArray(taxData.familia.size > 0 ? Array.from(taxData.familia) : familias),
            status: cleanArray(statuses),
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET /api/admin/check - Check admin authentication status
app.get('/api/admin/check', async (req, res) => {
    try {
        // Currently returns false - admin check is handled by NextAuth on frontend
        res.json({ isAdmin: false });
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.json({ isAdmin: false });
    }
});

// POST /api/admin/approve - Approve or reject user-submitted species
app.post('/api/admin/approve', async (req, res) => {
    try {
        // Connect to MongoDB
        await connectToDatabase();
        
        // Extract species ID and approval action from request
        const { speciesId, action } = req.body;
        
        // Validate input parameters
        if (!speciesId || !action || !['approved', 'rejected'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid species ID or action'
            });
        }
        
        // Find species in database
        const species = await Species.findById(speciesId);
        if (!species) {
            return res.status(404).json({
                success: false,
                error: 'Species not found'
            });
        }
        
        // Update approval state
        species.state = action;
        await species.save();
        
        // Return updated species with success message
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

// GET /api/test - Health check endpoint
app.get('/api/test', (req, res) => {
    // Return server status without making database calls
    res.json({ 
        success: true, 
        message: 'Express server is working!', 
        mongoUri: process.env.MONGODB_URI ? 'Connected' : 'Not found' 
    });
});

// POST /api/contact - Handle contact form submissions
app.post('/api/contact', async (req, res) => {
    try {
        // Extract contact form data
        const { name, email, comment } = req.body;
        // Log submission (could be extended to save to database)
        console.log('Contact form submission:', { name, email, comment });
        // Return success response
        res.json({ success: true, name });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, error: 'Failed to process request' });
    }
});

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Handle unresolved promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    process.exit(0);
});

// Start the Express server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Express server running on http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB URI available: ${!!process.env.MONGODB_URI}`);
    console.log(`Process ID: ${process.pid}`);
});

export default app;