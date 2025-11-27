"use client";

import Link from 'next/link';

export default function Learn() {
    return (
        <>
            <style jsx>{`
                .learn-page {
                    background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 50%, #C8E6C9 100%);
                    min-height: 100vh;
                    padding: 4rem 0;
                }
                
                .learn-header {
                    text-align: center;
                    margin-bottom: 4rem;
                    animation: fadeInUp 0.6s ease;
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
                
                .learn-header h1 {
                    color: #1B5E20;
                    font-weight: 900;
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    text-shadow: 2px 2px 4px rgba(85, 139, 47, 0.1);
                }
                
                .learn-header p {
                    color: #558B2F;
                    font-size: 1.2rem;
                    font-weight: 600;
                }
                
                .section-title {
                    color: #1B5E20;
                    font-weight: 800;
                    font-size: 2rem;
                    margin-bottom: 2.5rem;
                    text-align: center;
                    position: relative;
                    padding-bottom: 1rem;
                }
                
                .section-title::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80px;
                    height: 4px;
                    background: linear-gradient(90deg, #558B2F 0%, #33691E 100%);
                    border-radius: 2px;
                }
                
                .learn-card {
                    background: linear-gradient(135deg, white 0%, #FAFAFA 100%);
                    border: 2px solid #E8F5E9;
                    border-radius: 25px;
                    height: 100%;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(85, 139, 47, 0.12);
                    animation: fadeInScale 0.6s ease;
                }
                
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .learn-card:hover {
                    border-color: #558B2F;
                    transform: translateY(-10px);
                    box-shadow: 0 15px 50px rgba(85, 139, 47, 0.25);
                }
                
                .learn-card .card-body {
                    padding: 2rem;
                }
                
                .learn-card .emoji-icon {
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                    display: block;
                    animation: bounce 2s infinite;
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                .learn-card h5 {
                    color: #1B5E20 !important;
                    margin-bottom: 1rem;
                    font-weight: 800;
                    font-size: 1.3rem;
                }
                
                .learn-card p {
                    color: #558B2F;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }
                
                .learn-card .btn {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    border: none;
                    color: white !important;
                    font-weight: 700;
                    transition: all 0.3s ease;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 4px 15px rgba(85, 139, 47, 0.3);
                }
                
                .learn-card .btn:hover {
                    transform: translateX(5px);
                    box-shadow: 0 6px 20px rgba(85, 139, 47, 0.4);
                }
                
                .api-card {
                    background: linear-gradient(135deg, white 0%, #FAFAFA 100%);
                    border: 2px solid #E8F5E9;
                    border-radius: 25px;
                    padding: 2.5rem;
                    margin-bottom: 2rem;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 30px rgba(85, 139, 47, 0.12);
                    animation: fadeInRight 0.8s ease;
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
                
                .api-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 12px 40px rgba(85, 139, 47, 0.2);
                    border-color: #558B2F;
                }
                
                .api-card h4 {
                    color: #1B5E20;
                    font-weight: 800;
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .api-card .api-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                    box-shadow: 0 4px 15px rgba(85, 139, 47, 0.3);
                }
                
                .api-card p {
                    color: #558B2F;
                    line-height: 1.7;
                    margin-bottom: 1rem;
                }
                
                .api-card a {
                    color: #558B2F;
                    font-weight: 700;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }
                
                .api-card a:hover {
                    color: #33691E;
                    transform: translateX(5px);
                }
                
                .api-section {
                    margin-top: 5rem;
                    padding-top: 3rem;
                    border-top: 3px solid #E8F5E9;
                }
            `}</style>

            <div className="learn-page">
                <div className="container">
                    <div className="learn-header">
                        <h1><i className="bi bi-book-fill me-3"></i>Learn About Biodiversity</h1>
                        <p>Discover the science behind conservation and why every species matters</p>
                    </div>

                    <div className="row g-4 mb-5">
                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="card learn-card">
                                <div className="card-body">
                                    <span className="emoji-icon">🐝</span>
                                    <h5 className="card-title">The Importance of Pollinators</h5>
                                    <p className="card-text">Discover why bees, butterflies, and bats are crucial for our ecosystems and food security.</p>
                                    <a href="https://www.worldwildlife.org/initiatives/pollinator-protection" target="_blank" rel="noopener noreferrer" className="btn">
                                        Read more <i className="bi bi-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="card learn-card">
                                <div className="card-body">
                                    <span className="emoji-icon">♻️</span>
                                    <h5 className="card-title">5 Actions You Can Take Today</h5>
                                    <p className="card-text">Small changes in your daily life that have a big impact on biodiversity and the planet.</p>
                                    <a href="https://www.conservation.org/act/live-sustainably" target="_blank" rel="noopener noreferrer" className="btn">
                                        Read more <i className="bi bi-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="card learn-card">
                                <div className="card-body">
                                    <span className="emoji-icon">🔗</span>
                                    <h5 className="card-title">Understanding Food Webs</h5>
                                    <p className="card-text">Learn how every species, big or small, plays a critical role in maintaining ecosystem balance.</p>
                                    <a href="https://www.nationalgeographic.org/encyclopedia/food-web/" target="_blank" rel="noopener noreferrer" className="btn">
                                        Read more <i className="bi bi-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="card learn-card">
                                <div className="card-body">
                                    <span className="emoji-icon">⚠️</span>
                                    <h5 className="card-title">The Threat of Invasive Species</h5>
                                    <p className="card-text">Find out how non-native species can disrupt local ecosystems and threaten biodiversity.</p>
                                    <a href="https://www.iucn.org/resources/issues-brief/invasive-alien-species" target="_blank" rel="noopener noreferrer" className="btn">
                                        Read more <i className="bi bi-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="card learn-card">
                                <div className="card-body">
                                    <span className="emoji-icon">✅</span>
                                    <h5 className="card-title">Success Stories in Conservation</h5>
                                    <p className="card-text">Read about species that have been brought back from the brink of extinction through conservation efforts.</p>
                                    <a href="https://www.worldwildlife.org/stories/7-species-saved-from-extinction" target="_blank" rel="noopener noreferrer" className="btn">
                                        Read more <i className="bi bi-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="card learn-card">
                                <div className="card-body">
                                    <span className="emoji-icon">🌍</span>
                                    <h5 className="card-title">How Climate Change Affects Wildlife</h5>
                                    <p className="card-text">Explore the connection between global warming, habitat loss, and species extinction.</p>
                                    <a href="https://www.worldwildlife.org/threats/effects-of-climate-change" target="_blank" rel="noopener noreferrer" className="btn">
                                        Read more <i className="bi bi-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API Section */}
                    <div className="api-section">
                        <h2 className="section-title">
                            <i className="bi bi-code-square me-2"></i>
                            APIs & Data Sources
                        </h2>

                        <div className="row g-4">
                            <div className="col-lg-6">
                                <div className="api-card">
                                    <h4>
                                        <div className="api-icon">
                                            <i className="bi bi-globe"></i>
                                        </div>
                                        iNaturalist API
                                    </h4>
                                    <p>
                                        We use the iNaturalist API to fetch real-time observation data and generate distribution heatmaps.
                                        This crowdsourced platform provides millions of species observations from around the world.
                                    </p>
                                    <a href="https://www.inaturalist.org/pages/api+reference" target="_blank" rel="noopener noreferrer">
                                        View Documentation <i className="bi bi-box-arrow-up-right"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="api-card">
                                    <h4>
                                        <div className="api-icon">
                                            <i className="bi bi-wikipedia"></i>
                                        </div>
                                        Wikipedia API
                                    </h4>
                                    <p>
                                        Species descriptions and summaries are fetched from the Wikipedia REST API, providing
                                        comprehensive and accessible information about each species in multiple languages.
                                    </p>
                                    <a href="https://en.wikipedia.org/api/rest_v1/" target="_blank" rel="noopener noreferrer">
                                        View Documentation <i className="bi bi-box-arrow-up-right"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="api-card">
                                    <h4>
                                        <div className="api-icon">
                                            <i className="bi bi-database"></i>
                                        </div>
                                        MongoDB Atlas
                                    </h4>
                                    <p>
                                        Our species database is powered by MongoDB Atlas, storing comprehensive taxonomic information,
                                        conservation status, photos, and location data for endangered species.
                                    </p>
                                    <a href="https://www.mongodb.com/docs/atlas/" target="_blank" rel="noopener noreferrer">
                                        View Documentation <i className="bi bi-box-arrow-up-right"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="api-card">
                                    <h4>
                                        <div className="api-icon">
                                            <i className="bi bi-map"></i>
                                        </div>
                                        Leaflet.js & OpenStreetMap
                                    </h4>
                                    <p>
                                        Interactive maps are built using Leaflet.js with OpenStreetMap tiles and the Leaflet.heat plugin
                                        for visualizing species distribution patterns and observation density.
                                    </p>
                                    <a href="https://leafletjs.com/reference.html" target="_blank" rel="noopener noreferrer">
                                        View Documentation <i className="bi bi-box-arrow-up-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}