// Load environment variables - prioritize .env.local in development
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env first, then .env.local (with override for dev/local)
dotenv.config({ path: path.join(__dirname, '.env') });
// Only load .env.local if it exists (for development)
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
    dotenv.config({ path: path.join(__dirname, '.env.local'), override: true });
}

import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './lib/mongodb-express.js';
import Species from './lib/models/Species-express.js';

// In-memory cache for filter options
let filtersCache = null;
let filtersCacheTime = null;
const FILTERS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

function getFiltersCache() {
    const now = Date.now();
    if (filtersCache && filtersCacheTime && (now - filtersCacheTime) < FILTERS_CACHE_TTL) {
        console.log('[Cache] Using cached filters (age: ' + (now - filtersCacheTime) + 'ms)');
        return filtersCache;
    }
    return null;
}

function setFiltersCache(data) {
    filtersCache = data;
    filtersCacheTime = Date.now();
    console.log('[Cache] Filters cached for 5 minutes');
}

// Initialize Express application
const app = express();
// Port for Express server (separate from Next.js frontend on port 3000)
// In production (Render), use EXPRESS_PORT explicitly to avoid conflict with Next.js PORT
const PORT = process.env.EXPRESS_PORT || process.env.PORT || 3001;

// Enable CORS to allow requests from Next.js frontend
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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
        // Check cache first
        const cached = getFiltersCache();
        if (cached) {
            return res.json(cached);
        }
        
        console.log('[Filters] Cache miss - fetching from database...');
        
        // Connect to MongoDB
        await connectToDatabase();

        // Use MongoDB aggregation pipeline for performance
        // This is much faster than loading all documents into memory
        const filterResults = await Species.aggregate([
            {
                $facet: {
                    reinos: [
                        { $match: { reino: { $exists: true, $ne: '', $ne: null } } },
                        { $group: { _id: '$reino' } },
                        { $project: { value: '$_id', _id: 0 } }
                    ],
                    filos: [
                        { $match: { filo: { $exists: true, $ne: '', $ne: null } } },
                        { $group: { _id: '$filo' } },
                        { $project: { value: '$_id', _id: 0 } }
                    ],
                    clases: [
                        { $match: { clase: { $exists: true, $ne: '', $ne: null } } },
                        { $group: { _id: '$clase' } },
                        { $project: { value: '$_id', _id: 0 } }
                    ],
                    ordenes: [
                        { $match: { orden: { $exists: true, $ne: '', $ne: null } } },
                        { $group: { _id: '$orden' } },
                        { $project: { value: '$_id', _id: 0 } }
                    ],
                    familias: [
                        { $match: { familia: { $exists: true, $ne: '', $ne: null } } },
                        { $group: { _id: '$familia' } },
                        { $project: { value: '$_id', _id: 0 } }
                    ],
                    statuses: [
                        { $match: { categoria_lista_roja: { $exists: true, $ne: '', $ne: null } } },
                        { $group: { _id: '$categoria_lista_roja' } },
                        { $project: { value: '$_id', _id: 0 } }
                    ]
                }
            }
        ]);

        const result = filterResults[0];
        
        // Helper function to clean and sort filter arrays
        const cleanArray = (arr) => {
            return arr
                .map(item => String(item.value || '').trim())
                .filter(v => v && v !== null && v !== '')
                .sort();
        };
        
        const reinos = cleanArray(result.reinos || []);
        const filos = cleanArray(result.filos || []);
        const clases = cleanArray(result.clases || []);
        const ordenes = cleanArray(result.ordenes || []);
        const familias = cleanArray(result.familias || []);
        const statuses = cleanArray(result.statuses || []);

        // All 32 Mexican states - use default list for performance
        const estadosSet = [
            'aguascalientes', 'baja california', 'baja california sur', 'campeche', 'coahuila',
            'colima', 'chiapas', 'chihuahua', 'durango', 'guanajuato', 'guerrero', 'hidalgo',
            'jalisco', 'mexico', 'michoacan', 'morelos', 'nayarit', 'nuevo leon', 'oaxaca',
            'puebla', 'queretaro', 'quintana roo', 'san luis potosi', 'sinaloa', 'sonora',
            'tabasco', 'tamaulipas', 'tlaxcala', 'veracruz', 'yucatan', 'zacatecas'
        ];

        // Build response
        const filterResponse = {
            estados: estadosSet,
            reino: reinos,
            filo: filos,
            clase: clases,
            orden: ordenes,
            familia: familias,
            status: statuses,
        };
        
        // Cache the response (5 minutes)
        setFiltersCache(filterResponse);
        
        console.log(`[Filters] ✓ Loaded: ${reinos.length} reinos, ${filos.length} filos, ${clases.length} clases, ${ordenes.length} ordenes, ${familias.length} familias, ${statuses.length} statuses, 32 estados`);
        
        // Return all filter options in consistent format
        res.json(filterResponse);
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

// Return 404 for unmatched routes (Express is API-only)
app.use((req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Start the Express server
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
app.listen(PORT, host, () => {
    console.log(`Express API server running on http://${host}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB URI available: ${!!process.env.MONGODB_URI}`);
    console.log(`Process ID: ${process.pid}`);
});

export default app;