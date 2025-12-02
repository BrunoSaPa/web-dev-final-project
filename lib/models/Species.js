import mongoose from 'mongoose';

// Mongoose schema for species documents in MongoDB
const SpeciesSchema = new mongoose.Schema(
    {
        // Scientific name of the species (Latin/taxonomic name)
        nombre_cientifico: {
            type: String,
            required: true,
            unique: true,
        },
        // Common name of the species (may be in Spanish)
        nombre_comun: {
            type: String,
            default: '',
        },
        // Conservation status from Red List (e.g., "Endangered", "Not Assessed")
        categoria_lista_roja: {
            type: String,
            required: true,
        },
        // Array of photo URLs for the species
        fotos: {
            type: [String],
            default: [],
        },
        // Main photo URL displayed for species
        foto_principal: {
            type: String,
            default: '/images/default.png',
        },
        // Individual photo fields (alternative structure)
        foto_1: {
            type: String,
            default: null,
        },
        foto_2: {
            type: String,
            default: null,
        },
        foto_3: {
            type: String,
            default: null,
        },
        foto_4: {
            type: String,
            default: null,
        },
        // Description or additional information about the species
        descripcion: {
            type: String,
            default: '',
        },
        // External ID from Sistema de Información Taxonomica (SIS)
        id_taxon_sis: {
            type: Number,
            default: null,
        },
        // External ID from iNaturalist database
        inat_id: {
            type: Number,
            default: null,
        },
        // External ID from Global Biodiversity Information Facility (GBIF)
        gbif_id: {
            type: Number,
            default: null,
        },
        // Complete JSON data with full taxonomy and metadata
        json_completo: {
            type: String,
            default: null,
        },
        // JSON array of location/state data where species is found
        top_lugares: {
            type: String,
            default: null,
        },
        // User ID or email of who submitted this species
        added_by: {
            type: String,
            required: true,
        },
        // Approval state for user-submitted species (pending/approved/rejected)
        state: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    // Specify collection name and enable automatic timestamps (createdAt, updatedAt)
    { collection: 'especies', timestamps: true }
);

// Export model - use existing or create new
export default mongoose.models.Species || mongoose.model('Species', SpeciesSchema);

