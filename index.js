// Basic server setup
const express = require('express');
const https = require('https');
const app = express();
const axios = require('axios');
const port = 3005;

// Allow form data and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));
app.set('view engine', 'ejs');

// Home page with random featured species
app.get('/', async (req, res) => {
    try {
        // Get 3 random species from our data
        const shuffled = [...iucnSpeciesData].sort(() => 0.5 - Math.random());
        const randomSpecies = shuffled.slice(0, 3);
        
        // Fetch details for each random species
        const featuredSpecies = await Promise.all(
            randomSpecies.map(species => fetchEnciclovidaDetails(species))
        );
        
        res.render('index', { 
            weather: null, 
            error: null,
            featuredSpecies: featuredSpecies
        });
    } catch (error) {
        console.error('Error fetching featured species:', error);
        // Fallback to empty array if there's an error
        res.render('index', { 
            weather: null, 
            error: null,
            featuredSpecies: []
        });
    }
});

const iucnSpeciesData = require('./especies.json');

const ENCICLOVIDA_HEADERS = { 'Accept': 'application/json' };
const PLACEHOLDER_IMAGE = '/images/default.png';

// Get more details for one species using Enciclovida APIs
async function fetchEnciclovidaDetails(iucnSpecies) {
  const speciesTemplate = {
    image: PLACEHOLDER_IMAGE,
    commonName: iucnSpecies.nombre_cientifico,
    scientificName: iucnSpecies.nombre_cientifico,
    statusLabel: iucnSpecies.categoria_lista_roja || 'No disponible',
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
      } else {
        if (hasEstatus === false) {
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
    }

    return speciesTemplate;

  } catch (error) {
    console.error(`Error procesando ${iucnSpecies.nombre_cientifico}: ${error.message}`);
    return speciesTemplate;
  }
}

// Redirect to page 1 of the catalog, keeping the limit if set
app.get('/catalog', (req, res) => {
  const limit = req.query.limit;
  const suffix = (limit && parseInt(limit) > 0 && parseInt(limit) !== 15) ? `?limit=${parseInt(limit)}` : '';
  res.redirect(`/catalog/page/1${suffix}`);
});

// Show a paginated list of species
app.get('/catalog/page/:page', async (req, res) => {
  const pageParam = parseInt(req.params.page) || 1;
  const page = Math.max(1, pageParam);
  const limit = Math.max(1, parseInt(req.query.limit) || 15);

  const totalItems = iucnSpeciesData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const currentPage = Math.min(page, totalPages);

  const start = (currentPage - 1) * limit;
  const end = start + limit;

  const speciesToFetch = iucnSpeciesData.slice(start, end);

  const promises = speciesToFetch.map(species => fetchEnciclovidaDetails(species));

  try {
    const finalSpeciesData = await Promise.all(promises);
    res.render('catalog', {
      species: finalSpeciesData,
      pagination: {
        page: currentPage,
        totalPages,
        limit
      }
    });

  } catch (error) {
    console.error("Error mayor en Promise.all:", error);
    res.status(500).send("Error al contactar las APIs de Enciclovida");
  }
});

// Show details for one species using the scientific name in the URL
app.get('/especie/:id', async (req, res) => {
  const rawId = req.params.id || '';
  const scientificName = decodeURIComponent(rawId);

  const localEntry = iucnSpeciesData.find(s => s.nombre_cientifico === scientificName);

  if (!localEntry) {
    return res.status(404).render('especie', {
      name: scientificName,
      scientificName,
      image: PLACEHOLDER_IMAGE,
      region: null,
      habitat: null,
      threats: null,
      status: 'No disponible',
      description: 'No se encontró información para esta especie en el catálogo local.'
    });
  }

  try {
    const enc = await fetchEnciclovidaDetails(localEntry);

    const pageData = {
      name: enc.commonName || localEntry.nombre_cientifico,
      scientificName: enc.scientificName || localEntry.nombre_cientifico,
      image: enc.image || PLACEHOLDER_IMAGE,
      region: enc.region || null,
      habitat: enc.habitat || null,
      threats: enc.threats || null,
      status: enc.statusLabel || localEntry.categoria_lista_roja || 'No disponible',
      description: enc.description || ''
    };

    res.render('especie', pageData);
  } catch (error) {
    console.error('Error cargando detalles de especie:', error);
    res.status(500).send('Error al obtener detalles de la especie');
  }
});

// Simple pages for extra site sections
app.get('/learn', (req, res) => {
    res.render('learn');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contact', (req, res) => {
  const { name, email, comment } = req.body;
  console.log('Contact form submission:', { name, email, comment });
  nameSuccess = name;
  res.render('contact', { success: true, nameSuccess });
});

// Start the web server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});