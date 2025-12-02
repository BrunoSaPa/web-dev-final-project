'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// Client-side component for displaying detailed species information
export default function SpeciesDetailClient({ species }) {
    console.log('SpeciesDetailClient received species:', species);
    
    // State management
    const [loading, setLoading] = useState(true);
    const [wikiSummary, setWikiSummary] = useState(null);
    const [activeImage, setActiveImage] = useState(species.foto_principal || species.foto_1 || '/images/default.png');
    // Map references for Leaflet integration
    const mapInstanceRef = useRef(null);
    const layerControlRef = useRef(null);
    const heatmapLayerRef = useRef(null);

    // iNaturalist API configuration constants
    const API_INAT = 'https://api.inaturalist.org/v1';
    const MEXICO_PLACE_ID = 6793;
    const MEXICO_CENTER = [23.6345, -102.5528];
    const MEXICO_ZOOM = 5;

    // Parse complete JSON metadata
    let parsedData = null;
    try {
        parsedData = species.json_completo ? JSON.parse(species.json_completo) : null;
    } catch (e) {
        console.error('Error parsing json_completo:', e);
    }

    // Extract taxonomy information from parsed data
    const taxonomy = parsedData?.taxonomia || {};

    // Parse top locations where species is observed
    let topLocations = [];
    try {
        if (species.top_lugares) {
            const parsed = JSON.parse(species.top_lugares);
            // Format: "Location Name (count)"
            topLocations = parsed.map(loc => {
                const match = loc.match(/^(.+?)\s*\((\d+)\)$/);
                return match ? { name: match[1], count: parseInt(match[2]) } : { name: loc, count: 0 };
            });
        }
    } catch (e) {
        console.error('Error parsing top_lugares:', e);
    }

    // Combine all images
    const allImages = [
        species.foto_principal,
        species.foto_1,
        species.foto_2,
        species.foto_3,
        species.foto_4,
        ...(species.fotos || [])
    ].filter(img => img && img !== '/images/default.png');

    const uniqueImages = [...new Set(allImages)];
    if (uniqueImages.length === 0) uniqueImages.push('/images/default.png');

    useEffect(() => {
        const loadLeaflet = async () => {
            if (typeof window === 'undefined') return;

            // Load CSS
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // Load JS
            if (!window.L) {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.onload = resolve;
                    document.body.appendChild(script);
                });
            }

            // Load Heatmap Plugin
            if (!window.L.heatLayer) {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
                    script.onload = resolve;
                    document.body.appendChild(script);
                });
            }

            initMap();
            if (species.inat_id) {
                fetchObservations();
            } else {
                setLoading(false);
            }

            // Fetch Wikipedia summary
            fetchWikipediaSummary();
        };

        loadLeaflet();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [species.inat_id]);

    const initMap = () => {
        if (mapInstanceRef.current || !document.getElementById('map')) return;

        const map = L.map('map', {
            center: MEXICO_CENTER,
            zoom: MEXICO_ZOOM,
            zoomControl: true,
            scrollWheelZoom: false
        });

        mapInstanceRef.current = map;

        const lightMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        const labelsMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
            opacity: 0.8,
            maxZoom: 19,
            zIndex: 500
        }).addTo(map);

        const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri',
            maxZoom: 19
        });

        const baseMaps = { "Light Map": lightMap, "Satellite": satelliteMap };
        layerControlRef.current = L.control.layers(baseMaps, {}, { position: 'topright', collapsed: true }).addTo(map);

        map.on('focus', () => map.scrollWheelZoom.enable());
        map.on('blur', () => map.scrollWheelZoom.disable());

        // Add legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.background = 'rgba(255, 255, 255, 0.95)';
            div.style.padding = '12px 16px';
            div.style.borderRadius = '12px';
            div.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            div.style.border = '1px solid rgba(85, 139, 47, 0.2)';
            div.innerHTML = `
                <div class="mb-2 text-uppercase fw-bold" style="font-size: 10px; color: #558B2F; letter-spacing: 1px;">Observation Density</div>
                <div style="height: 10px; width: 100%; background: linear-gradient(to right, #3b82f6, #06b6d4, #84cc16, #eab308, #ef4444); border-radius: 4px; margin-bottom: 8px;"></div>
                <div style="display: flex; justify-content: space-between; font-size: 9px; color: #666; font-weight: 600;">
                    <span>Low</span><span>High</span>
                </div>
            `;
            return div;
        };
        legend.addTo(map);
    };

    const fetchObservations = async () => {
        try {
            setLoading(true);
            const taxonId = species.inat_id;

            const fetchPromises = [1, 2, 3].map(page =>
                fetch(`${API_INAT}/observations?taxon_id=${taxonId}&place_id=${MEXICO_PLACE_ID}&per_page=200&page=${page}`)
                    .then(r => r.json())
            );

            const pagesData = await Promise.all(fetchPromises);
            const allObs = pagesData.flatMap(d => d.results || []);

            drawHeatmap(allObs, taxonId);
        } catch (err) {
            console.error("Error fetching observations:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWikipediaSummary = async () => {
        try {
            const searchRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(species.nombre_cientifico)}`);
            if (searchRes.ok) {
                const data = await searchRes.json();
                if (data.extract) {
                    setWikiSummary(data.extract);
                }
            }
        } catch (err) {
            console.error('Error fetching Wikipedia:', err);
        }
    };

    const drawHeatmap = (observations, taxonId) => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        // Remove existing heatmap if any
        if (heatmapLayerRef.current) {
            map.removeLayer(heatmapLayerRef.current);
            heatmapLayerRef.current = null;
        }

        const heatPoints = observations
            .filter(o => o.geojson?.coordinates)
            .map(o => [o.geojson.coordinates[1], o.geojson.coordinates[0], 1]);

        if (heatPoints.length > 0 && window.L.heatLayer) {
            const heatLayer = window.L.heatLayer(heatPoints, {
                radius: 25,
                blur: 15,
                maxZoom: 10,
                gradient: {
                    0.0: 'blue',
                    0.3: 'cyan',
                    0.5: 'lime',
                    0.7: 'yellow',
                    1.0: 'red'
                },
                minOpacity: 0.4
            });
            heatLayer.addTo(map);
            heatmapLayerRef.current = heatLayer;
            layerControlRef.current.addOverlay(heatLayer, `<span class="text-sm fw-bold">🔥 Heatmap</span>`);
        }

        // iNat Points
        const inatPointsUrl = `${API_INAT}/points/{z}/{x}/{y}.png?taxon_id=${taxonId}&place_id=${MEXICO_PLACE_ID}&quality_grade=research&color=blue`;
        const inatLayer = L.tileLayer(inatPointsUrl, { opacity: 1, maxZoom: 19 });
        layerControlRef.current.addOverlay(inatLayer, `<span class="text-sm text-primary fw-bold">🔵 iNat Points</span>`);

        map.setView(MEXICO_CENTER, MEXICO_ZOOM);
    };

    const resetMapView = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(MEXICO_CENTER, MEXICO_ZOOM);
        }
    };

    return (
        <>
            <style jsx>{`
                .species-detail-page {
                    background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 50%, #C8E6C9 100%);
                    min-height: 100vh;
                    padding: 2rem 0 4rem 0;
                    position: relative;
                    z-index: 1;
                }
                
                .back-button {
                    background: linear-gradient(135deg, white 0%, #FAFAFA 100%);
                    border: 2px solid #E8F5E9;
                    color: #558B2F;
                    font-weight: 700;
                    padding: 0.75rem 1.75rem;
                    border-radius: 15px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    box-shadow: 0 2px 8px rgba(85, 139, 47, 0.1);
                    animation: slideInLeft 0.5s ease;
                }
                
                .back-button:hover {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    color: white;
                    border-color: #558B2F;
                    transform: translateX(-5px) translateY(-2px);
                    box-shadow: 0 6px 20px rgba(85, 139, 47, 0.3);
                }
                
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .species-header {
                    background: linear-gradient(135deg, white 0%, #FAFAFA 100%);
                    border-radius: 25px;
                    padding: 3rem;
                    box-shadow: 0 10px 40px rgba(85, 139, 47, 0.15);
                    border: 2px solid #E8F5E9;
                    margin-bottom: 2.5rem;
                    animation: fadeInUp 0.6s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .species-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 5px;
                    background: linear-gradient(90deg, #558B2F 0%, #33691E 50%, #558B2F 100%);
                    animation: shimmer 3s infinite;
                }
                
                @keyframes shimmer {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                
                .species-title {
                    color: #1B5E20;
                    font-weight: 900;
                    font-size: 3rem;
                    margin-bottom: 0.75rem;
                    line-height: 1.1;
                    animation: fadeInUp 0.6s ease;
                    text-shadow: 2px 2px 4px rgba(85, 139, 47, 0.1);
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .species-scientific {
                    color: #558B2F;
                    font-style: italic;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 1.75rem;
                    animation: fadeInUp 0.7s ease;
                }
                
                .status-badge-large {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 2rem;
                    border-radius: 50px;
                    font-weight: 800;
                    font-size: 1.1rem;
                    letter-spacing: 0.5px;
                    animation: fadeInUp 0.8s ease, pulse 2s infinite;
                    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                
                .gallery-card {
                    background: white;
                    border-radius: 25px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(85, 139, 47, 0.15);
                    height: 100%;
                    border: 2px solid #E8F5E9;
                    animation: fadeInScale 0.8s ease;
                    margin-bottom: 2rem;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .gallery-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 50px rgba(85, 139, 47, 0.25);
                }
                
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .main-image-container {
                    position: relative;
                    height: 450px;
                    overflow: hidden;
                    background: linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%);
                }
                
                .main-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .main-image:hover {
                    transform: scale(1.1);
                }
                
                .thumbnail-strip {
                    padding: 1.75rem;
                    background: linear-gradient(to bottom, #FAFAFA, white);
                    border-top: 2px solid #E8F5E9;
                }
                
                .thumbnail {
                    width: 75px;
                    height: 75px;
                    object-fit: cover;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 3px solid transparent;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                .thumbnail:hover {
                    transform: translateY(-6px) scale(1.05);
                    box-shadow: 0 6px 20px rgba(85, 139, 47, 0.3);
                }
                
                .thumbnail.active {
                    border-color: #558B2F;
                    box-shadow: 0 0 0 3px rgba(85, 139, 47, 0.3);
                    transform: scale(1.05);
                }
                
                .info-card {
                    background: linear-gradient(135deg, white 0%, #FAFAFA 100%);
                    border-radius: 25px;
                    padding: 2.5rem;
                    box-shadow: 0 8px 30px rgba(85, 139, 47, 0.12);
                    border: 2px solid #E8F5E9;
                    margin-bottom: 2rem;
                    animation: fadeInRight 1s ease;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .info-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 12px 40px rgba(85, 139, 47, 0.2);
                    border-color: #558B2F;
                }
                
                @keyframes fadeInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .section-title {
                    color: #1B5E20;
                    font-weight: 800;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 1.75rem;
                    padding-bottom: 1rem;
                    border-bottom: 3px solid #E8F5E9;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .section-title i {
                    font-size: 1.2rem;
                    color: #558B2F;
                }
                
                .taxonomy-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, #F9FBF9 0%, #F5F8F5 100%);
                    border-radius: 12px;
                    margin-bottom: 0.75rem;
                    border-left: 4px solid #558B2F;
                    transition: all 0.3s ease;
                    animation: slideInRight 0.5s ease;
                }
                
                .taxonomy-item:hover {
                    transform: translateX(5px);
                    box-shadow: 0 4px 12px rgba(85, 139, 47, 0.15);
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .taxonomy-label {
                    color: #558B2F;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    font-weight: 800;
                    letter-spacing: 1.2px;
                }
                
                .taxonomy-value {
                    color: #1B5E20;
                    font-weight: 700;
                    font-size: 1rem;
                }
                
                .location-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #E8F5E9;
                    transition: all 0.3s ease;
                    animation: fadeIn 0.6s ease;
                }
                
                .location-item:hover {
                    background: #F9FBF9;
                    transform: translateX(5px);
                }
                
                .location-item:last-child {
                    border-bottom: none;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .location-rank {
                    width: 38px;
                    height: 38px;
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.9rem;
                    flex-shrink: 0;
                    box-shadow: 0 3px 10px rgba(85, 139, 47, 0.3);
                }
                
                .location-name {
                    flex: 1;
                    margin: 0 1.25rem;
                    color: #1B5E20;
                    font-weight: 600;
                    font-size: 0.95rem;
                }
                
                .location-count {
                    background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 100%);
                    color: #558B2F;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 0.95rem;
                    box-shadow: 0 2px 6px rgba(85, 139, 47, 0.15);
                }
                
                .map-card {
                    background: white;
                    border-radius: 25px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(85, 139, 47, 0.15);
                    border: 2px solid #E8F5E9;
                    height: 600px;
                    animation: fadeInScale 1s ease;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .map-card:hover {
                    box-shadow: 0 15px 50px rgba(85, 139, 47, 0.25);
                }
                
                .map-header {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    color: white !important;
                    padding: 2rem 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 15px rgba(85, 139, 47, 0.3);
                }
                
                .map-title {
                    font-weight: 800;
                    font-size: 1.3rem;
                    color: white !important;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .map-title i {
                    font-size: 1.5rem;
                }
                
                .recenter-btn {
                    background: rgba(255, 255, 255, 0.25);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    color: white !important;
                    padding: 0.65rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }
                
                .recenter-btn:hover {
                    background: rgba(255, 255, 255, 0.35);
                    border-color: rgba(255, 255, 255, 0.6);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                
                #map {
                    height: calc(100% - 90px);
                    width: 100%;
                }
                
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.97);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                
                .spinner {
                    border: 5px solid #E8F5E9;
                    border-top: 5px solid #558B2F;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    animation: spin 0.8s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @media (max-width: 992px) {
                    .species-title {
                        font-size: 2.2rem;
                    }
                    .species-header {
                        padding: 2rem;
                    }
                    .map-card {
                        height: 600px;
                        margin-top: 2rem;
                    }
                }
            `}</style>

            <div className="species-detail-page">
                <div className="container">
                    <Link href="/catalog" className="back-button mb-4">
                        <i className="bi bi-arrow-left"></i>
                        Back to Catalog
                    </Link>

                    <div className="species-header">
                        <h1 className="species-title">
                            {species.nombre_comun || species.nombre_cientifico}
                        </h1>
                        <p className="species-scientific">{species.nombre_cientifico}</p>
                        <span className="status-badge-large bg-danger text-white">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            {species.categoria_lista_roja}
                        </span>
                    </div>

                    {/* Top Row: Gallery + Taxonomy/Locations */}
                    <div className="row g-4 mb-4">
                        {/* Gallery - Smaller */}
                        <div className="col-lg-4">
                            <div className="gallery-card">
                                <div className="main-image-container" style={{ height: '320px' }}>
                                    <img
                                        src={activeImage}
                                        className="main-image"
                                        alt={species.nombre_comun}
                                        onError={(e) => e.target.src = '/images/default.png'}
                                    />
                                </div>
                                {uniqueImages.length > 1 && (
                                    <div className="thumbnail-strip">
                                        <div className="d-flex gap-2 overflow-auto flex-wrap justify-content-center">
                                            {uniqueImages.slice(0, 4).map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                                                    onClick={() => setActiveImage(img)}
                                                    alt={`View ${idx + 1}`}
                                                    onError={(e) => e.target.src = '/images/default.png'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Taxonomy and Locations - Stacked */}
                        <div className="col-lg-8">
                            <div className="row g-4">
                                {/* Taxonomy */}
                                <div className="col-md-6">
                                    <div className="info-card" style={{ height: '100%' }}>
                                        <h3 className="section-title">
                                            <i className="bi bi-diagram-3"></i>
                                            Taxonomy
                                        </h3>
                                        {Object.keys(taxonomy).length > 0 ? (
                                            <div>
                                                {taxonomy.reino && (
                                                    <div className="taxonomy-item">
                                                        <span className="taxonomy-label">Kingdom</span>
                                                        <span className="taxonomy-value">{taxonomy.reino}</span>
                                                    </div>
                                                )}
                                                {taxonomy.filo && (
                                                    <div className="taxonomy-item">
                                                        <span className="taxonomy-label">Phylum</span>
                                                        <span className="taxonomy-value">{taxonomy.filo}</span>
                                                    </div>
                                                )}
                                                {taxonomy.clase && (
                                                    <div className="taxonomy-item">
                                                        <span className="taxonomy-label">Class</span>
                                                        <span className="taxonomy-value">{taxonomy.clase}</span>
                                                    </div>
                                                )}
                                                {taxonomy.orden && (
                                                    <div className="taxonomy-item">
                                                        <span className="taxonomy-label">Order</span>
                                                        <span className="taxonomy-value">{taxonomy.orden}</span>
                                                    </div>
                                                )}
                                                {taxonomy.familia && (
                                                    <div className="taxonomy-item">
                                                        <span className="taxonomy-label">Family</span>
                                                        <span className="taxonomy-value">{taxonomy.familia}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-muted small">Taxonomy data not available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Top Locations */}
                                <div className="col-md-6">
                                    <div className="info-card" style={{ height: '100%' }}>
                                        <h3 className="section-title">
                                            <i className="bi bi-geo-alt"></i>
                                            Top Locations
                                        </h3>
                                        {topLocations.length > 0 ? (
                                            topLocations.slice(0, 5).map((loc, i) => (
                                                <div key={i} className="location-item">
                                                    <div className="location-rank">{i + 1}</div>
                                                    <div className="location-name">{loc.name}</div>
                                                    <div className="location-count">{loc.count}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted small fst-italic">No location data available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Wikipedia + Map */}
                    <div className="row g-4">
                        {/* Wikipedia Description */}
                        <div className="col-lg-5">
                            <div className="info-card" style={{ height: '100%' }}>
                                <h3 className="section-title">
                                    <i className="bi bi-book"></i>
                                    About This Species
                                </h3>
                                {wikiSummary ? (
                                    <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                                        {wikiSummary}
                                    </p>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="bi bi-book" style={{ fontSize: '3rem', color: '#558B2F', opacity: 0.3 }}></i>
                                        <p className="text-muted small mt-3 mb-0">
                                            Additional information about this species is currently unavailable.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="col-lg-7">
                            <div className="map-card" style={{ height: '550px' }}>
                                <div className="map-header">
                                    <h2 className="map-title">
                                        <i className="bi bi-map"></i>
                                        Distribution Map
                                    </h2>
                                    <button onClick={resetMapView} className="recenter-btn">
                                        <i className="bi bi-crosshair me-2"></i>
                                        Recenter
                                    </button>
                                </div>
                                <div style={{ position: 'relative', height: 'calc(100% - 90px)' }}>
                                    {loading && (
                                        <div className="loading-overlay">
                                            <div className="spinner mb-3"></div>
                                            <p className="text-muted fw-bold">Loading map data...</p>
                                        </div>
                                    )}
                                    <div id="map"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
