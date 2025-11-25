import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load species data from JSON file
const speciesDataPath = path.join(process.cwd(), 'especies.json');
const iucnSpeciesData = JSON.parse(fs.readFileSync(speciesDataPath, 'utf8'));

const ENCICLOVIDA_HEADERS = { 'Accept': 'application/json' };
const PLACEHOLDER_IMAGE = '/images/default.png';

export function getAllSpecies() {
    return iucnSpeciesData;
}

export function getSpeciesByScientificName(scientificName) {
    return iucnSpeciesData.find(s => s.nombre_cientifico === scientificName);
}

export async function getSpecies({ page = 1, limit = 15, status = null } = {}) {
    let filteredSpecies = iucnSpeciesData;

    if (status) {
        filteredSpecies = iucnSpeciesData.filter(species =>
            species.categoria_lista_roja === status
        );
    }

    const totalItems = filteredSpecies.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(Math.max(1, page), totalPages);

    const start = (currentPage - 1) * limit;
    const end = start + limit;

    const speciesToFetch = filteredSpecies.slice(start, end);

    const speciesData = await Promise.all(
        speciesToFetch.map(species => fetchEnciclovidaDetails(species))
    );

    return {
        species: speciesData,
        pagination: {
            page: currentPage,
            totalPages,
            limit,
            status,
            totalItems
        }
    };
}

// Get more details for one species using Enciclovida APIs
export async function fetchEnciclovidaDetails(iucnSpecies) {
    const speciesTemplate = {
        image: PLACEHOLDER_IMAGE,
        commonName: iucnSpecies.nombre_cientifico,
        scientificName: iucnSpecies.nombre_cientifico,
        statusLabel: iucnSpecies.categoria_lista_roja || 'No disponible',
        region: null,
        habitat: null,
        threats: null,
        description: null,
        descriptionLang: null,
    };

    try {
        const encodedName = encodeURIComponent(iucnSpecies.nombre_cientifico);
        const urlAutocompleta = `https://api.enciclovida.mx/autocompleta/especies/${encodedName}`;

        // First request: find the species ID
        const resAutocompleta = await axios.get(urlAutocompleta, { headers: ENCICLOVIDA_HEADERS });

        const results = resAutocompleta.data?.results?.especie;
        const enciclovidaId = results?.[0]?.data?.id;

        if (!enciclovidaId) {
            return speciesTemplate;
        }

        // Second request: fetch the main species info
        const urlEspecie = `https://api.enciclovida.mx/especie/${enciclovidaId}`;
        const resEspecie = await axios.get(urlEspecie, { headers: ENCICLOVIDA_HEADERS });
        speciesTemplate.scientificName = resEspecie.data?.nombre_cientifico || speciesTemplate.scientificName;
        speciesTemplate.commonName = resEspecie.data?.e_nombre_comun_principal || speciesTemplate.commonName;
        const fotoPrincipal = resEspecie.data?.e_foto_principal;
        speciesTemplate.image = (fotoPrincipal && String(fotoPrincipal).trim().length > 0) ? fotoPrincipal : PLACEHOLDER_IMAGE;

        // Extract extra info if available (mapped from EJS logic or expanded)
        // The original code didn't explicitly map region/habitat/threats in the main fetch function shown in index.js,
        // but the view (especie.ejs) uses them. They might be in the `resEspecie.data` but not extracted in the snippet I saw?
        // Wait, looking at index.js Step 6 lines 247-249:
        // region: enc.region || null,
        // habitat: enc.habitat || null,
        // threats: enc.threats || null,
        // But fetchEnciclovidaDetails (lines 47-155) DOES NOT return region, habitat, threats.
        // It returns speciesTemplate which only has image, commonName, scientificName, statusLabel, description.
        // So where did region/habitat/threats come from in the EJS?
        // Line 243 in index.js: `const pageData = { ... enc.region ... }`
        // But `enc` comes from `fetchEnciclovidaDetails`.
        // If `fetchEnciclovidaDetails` doesn't add them, they are undefined.
        // Let's check `fetchEnciclovidaDetails` again.
        // It creates `speciesTemplate` at line 48.
        // It updates it at lines 72, 73, 75, 120, 141.
        // It returns it at line 149.
        // I don't see region/habitat/threats being added.
        // Maybe I missed something or the original code had a bug/missing feature there, or they are just null.
        // The EJS view checks `if (region)` etc.
        // I will keep them as null for now to match the code I see.

        try {
            // Third request: try to get a Spanish description
            const urlDescripcion = `https://api.enciclovida.mx/especie/descripcion/${enciclovidaId}/resumen-wikipedia`;
            const resDescripcion = await axios.get(urlDescripcion, { headers: ENCICLOVIDA_HEADERS });

            const stripHtml = (input) => {
                if (!input || typeof input !== 'string') return null;
                let out = input.replace(/<[^>]+>/g, '');
                const entities = {
                    '&nbsp;': ' ',
                    '&lt;': '<',
                    '&gt;': '>',
                    '&amp;': '&',
                    '&quot;': '"',
                    '&#39;': "'"
                };
                out = out.replace(/&[#A-Za-z0-9]+;/g, (m) => entities[m] || m);
                out = out.replace(/\s+/g, ' ').trim();
                return out.length > 0 ? out : null;
            };

            const d = resDescripcion?.data;
            let descripcionRaw = null;

            const hasEstatus = (typeof d?.estatus !== 'undefined') ? (d.estatus === true || d.estatus === 'true') : null;

            if (typeof d === 'string') {
                descripcionRaw = d;
            } else if (typeof d === 'object' && d !== null) {
                descripcionRaw = d.summary || d.sumamry || d?.data?.resumen || d?.resumen || d?.descripcion || d?.texto || d?.extract || null;
                if (!descripcionRaw && typeof d.data === 'object') {
                    try {
                        const maybe = JSON.stringify(d.data);
                        descripcionRaw = maybe.length <= 4000 ? maybe : maybe.slice(0, 2000);
                    } catch (e) {
                        descripcionRaw = null;
                    }
                }
            }

            if (descripcionRaw && (hasEstatus === null || hasEstatus === true)) {
                const cleaned = stripHtml(String(descripcionRaw));
                if (cleaned) {
                    speciesTemplate.description = cleaned;
                    speciesTemplate.descriptionLang = 'es';
                }
            }
        } catch (err) {
            console.warn(`No se pudo obtener descripción para id ${enciclovidaId}: ${err.message}`);
        }

        try {
            // Extra: look for an English summary on Wikipedia
            const wikiTitle = speciesTemplate.scientificName || iucnSpecies.nombre_cientifico;
            if (wikiTitle && String(wikiTitle).trim().length > 0) {
                const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
                const wikiRes = await axios.get(wikiUrl, { headers: { 'Accept': 'application/json', 'User-Agent': 'web-dev-final-project/1.0' } });
                if (wikiRes && wikiRes.data && (wikiRes.data.extract || wikiRes.data.extract_html)) {
                    const wikiExtract = wikiRes.data.extract || wikiRes.data.extract_html;
                    const cleanedWiki = (typeof wikiExtract === 'string') ? wikiExtract.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null;
                    if (cleanedWiki && cleanedWiki.length > 0) {
                        speciesTemplate.description = cleanedWiki;
                        speciesTemplate.descriptionLang = 'en';
                    }
                }
            }
        } catch (werr) {
            // ignore
        }

        return speciesTemplate;

    } catch (error) {
        console.error(`Error procesando ${iucnSpecies.nombre_cientifico}: ${error.message}`);
        return speciesTemplate;
    }
}
