import mongoose from 'mongoose';

const SpeciesSchema = new mongoose.Schema(
    {
        nombre_cientifico: {
            type: String,
            required: true,
            unique: true,
        },
        nombre_comun: {
            type: String,
            default: '',
        },
        categoria_lista_roja: {
            type: String,
            required: true,
        },
        fotos: {
            type: [String],
            default: [],
        },
        foto_principal: {
            type: String,
            default: '/images/default.png',
        },
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
        descripcion: {
            type: String,
            default: '',
        },
        id_taxon_sis: {
            type: Number,
            default: null,
        },
        inat_id: {
            type: Number,
            default: null,
        },
        gbif_id: {
            type: Number,
            default: null,
        },
        top_lugares: {
            type: String,
            default: null,
        },
        reino: {
            type: String,
            default: '',
        },
        filo: {
            type: String,
            default: '',
        },
        clase: {
            type: String,
            default: '',
        },
        orden: {
            type: String,
            default: '',
        },
        familia: {
            type: String,
            default: '',
        },
        genero: {
            type: String,
            default: '',
        },
        json_completo: {
            type: String,
            default: null,
        },
        added_by: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        collection: 'especies',
        timestamps: true,
    }
);

export default mongoose.models.Species || mongoose.model('Species', SpeciesSchema);