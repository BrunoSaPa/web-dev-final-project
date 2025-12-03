import Link from 'next/link';
import FeaturedSpeciesCarousel from './components/FeaturedSpeciesCarousel';
import { getSpecies } from '@/lib/controllers/speciesController';

export const dynamic = 'force-dynamic'; // Ensure random species are generated on each request

export default async function Home() {
    // Fetch random species from API
    let featuredSpecies = [];

    try {
        // Determine API base URL based on environment
        let baseUrl;
        
        if (process.env.NODE_ENV === 'production') {
            // In production, Express runs on same server with /api prefix or on separate port
            baseUrl = 'http://localhost:3001';
        } else {
            // In development, Express runs on port 3001
            baseUrl = 'http://localhost:3001';
        }
        
        const response = await fetch(`${baseUrl}/api/species?page=1&limit=100`, {
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.species) {
                // Get 3 random species from the results
                const allSpecies = data.species || [];
                if (allSpecies.length > 0) {
                    const shuffled = [...allSpecies].sort(() => 0.5 - Math.random());
                    featuredSpecies = shuffled.slice(0, 3);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching featured species:', error);
        featuredSpecies = [];
    }

    return (
        <>
            <style>{`
                .hero-section {
                    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.15) 100%),
                                url('/images/hero-image.jpg') center/cover no-repeat;
                    background-attachment: fixed;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .hero-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at 20% 50%, rgba(85, 139, 47, 0.08) 0%, transparent 50%),
                                radial-gradient(circle at 80% 80%, rgba(51, 105, 30, 0.08) 0%, transparent 50%);
                    z-index: 0;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    max-width: 900px;
                    padding: 2rem;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                
                .hero-content h1 {
                    color: white !important;
                    font-weight: 800;
                    font-size: 3.5rem;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                    text-shadow: 3px 3px 12px rgba(0, 0, 0, 0.5);
                    letter-spacing: -0.5px;
                }
                
                .hero-content .lead {
                    color: rgba(255, 255, 255, 0.95) !important;
                    font-size: 1.25rem;
                    font-weight: 500;
                    margin-bottom: 2.5rem;
                    line-height: 1.6;
                    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
                }

                /* ... (skipping buttons) ... */

                .stats-section {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    color: white !important;
                    padding: 5rem 0;
                    position: relative;
                    overflow: hidden;
                }

                .stats-section .h2 {
                    color: white !important;
                    font-weight: 800;
                    font-size: 2.5rem;
                    margin-bottom: 0;
                }
                
                .stats-section p {
                    color: rgba(255, 255, 255, 0.95) !important;
                    font-weight: 500;
                    font-size: 1.05rem;
                    margin-bottom: 0;
                }

                /* ... (skipping featured) ... */

                .cta-section {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    color: white !important;
                    padding: 5rem 0;
                    position: relative;
                    overflow: hidden;
                }

                .cta-section h2 {
                    color: white !important;
                    font-weight: 800;
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }
                
                .cta-section p {
                    color: rgba(255, 255, 255, 0.95) !important;
                    line-height: 1.7;
                }
                
                .btn-primary-custom {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    border: none;
                    color: white !important;
                    font-weight: 600;
                    font-size: 1rem;
                    padding: 0.85rem 2.5rem;
                    border-radius: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(85, 139, 47, 0.3);
                }
                
                .btn-primary-custom:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(85, 139, 47, 0.5);
                    background: linear-gradient(135deg, #33691E 0%, #1B5E20 100%);
                    color: white !important;
                }
                
                .btn-outline-success {
                    color: white !important;
                    border-color: white !important;
                    font-weight: 600;
                    font-size: 1rem;
                    padding: 0.85rem 2.5rem;
                    border-width: 2px !important;
                    transition: all 0.3s ease;
                }
                
                .btn-outline-success:hover {
                    background-color: rgba(255, 255, 255, 0.15) !important;
                    border-color: white !important;
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
                    color: white !important;
                }
                
                .cta-section .btn-secondary {
                    background-color: #9CCC65;
                    border-color: #9CCC65;
                    color: #1B5E20;
                    font-weight: 700;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(156, 204, 101, 0.3);
                }
                
                .cta-section .btn-secondary:hover {
                    background-color: #7CB342;
                    border-color: #7CB342;
                    color: #1B5E20;
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(156, 204, 101, 0.4);
                }
                
                .cta-section .btn-outline-light {
                    color: white !important;
                    border-color: white !important;
                    font-weight: 700;
                    border-width: 2px !important;
                    transition: all 0.3s ease;
                }
                
                .cta-section .btn-outline-light:hover {
                    background-color: rgba(255, 255, 255, 0.15);
                    border-color: white !important;
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
                }
                
                .sdg-cards-section {
                    padding: 4rem 0;
                    justify-content: center;
                }
                
                .sdg-card {
                    background: white;
                    border: none;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    position: relative;
                }
                
                .sdg-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #558B2F 0%, #33691E 100%);
                }
                
                .sdg-card:hover {
                    box-shadow: 0 16px 32px rgba(85, 139, 47, 0.15);
                    transform: translateY(-8px);
                }
                
                .sdg-card .card-body {
                    padding: 2rem;
                }
                
                .sdg-card .mb-3 {
                    margin-bottom: 1.5rem !important;
                }
                
                .sdg-card i {
                    color: #558B2F;
                    transition: all 0.3s ease;
                }
                
                .sdg-card:hover i {
                    color: #33691E;
                    transform: scale(1.1) rotate(-5deg);
                }
                
                .sdg-card h5 {
                    color: #1B5E20;
                    font-weight: 700;
                    font-size: 1.3rem;
                    margin-bottom: 1rem;
                }
                
                .sdg-card p {
                    color: #666;
                    font-size: 1rem;
                    line-height: 1.6;
                    margin-bottom: 0;
                }
                
                .conservation-container {
                    margin: 4rem auto;
                }
                
                .conservation-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    position: relative;
                }
                
                .conservation-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(90deg, #558B2F 0%, #33691E 50%, #1B5E20 100%);
                }
                
                .conservation-card .card-body {
                    padding: 3rem;
                }
                
                .conservation-card h2 {
                    color: #1B5E20;
                    font-weight: 800;
                    font-size: 2rem;
                    margin-bottom: 1.5rem;
                }
                
                .conservation-card i {
                    color: #558B2F;
                    font-size: 2.5rem;
                }
                
                .conservation-card p {
                    color: #666;
                    font-size: 1.1rem;
                    line-height: 1.8;
                }
                
                @media (max-width: 768px) {
                    .hero-content {
                        padding: 1.5rem;
                    }
                    
                    .hero-content h1 {
                        font-size: 2.25rem;
                    }
                    
                    .hero-content .lead {
                        font-size: 1rem;
                    }
                    
                    .stats-section .h2 {
                        font-size: 2rem;
                    }
                    
                    .featured-section h2,
                    .cta-section h2 {
                        font-size: 2rem;
                    }
                    
                    .conservation-card .card-body {
                        padding: 2rem;
                    }
                    
                    .conservation-card h2 {
                        font-size: 1.5rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .hero-content h1 {
                        font-size: 1.75rem;
                    }
                    
                    .hero-content .lead {
                        font-size: 0.9rem;
                    }
                }
            `}</style>

            <div className="hero-section">
                <div className="hero-content">
                    <h1><i className="bi bi-leaf me-3"></i>Protecting Mexico's Endangered Species</h1>
                    <p className="lead">Mexico is home to over 1,000 endangered species. Join us in conservation efforts to protect biodiversity and preserve our natural heritage for future generations.</p>
                    <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                        <Link href="/catalog" className="btn btn-primary-custom">
                            <i className="bi bi-search me-2"></i>Explore Species
                        </Link>
                        <Link href="/learn" className="btn btn-outline-success btn-lg px-4">
                            <i className="bi bi-book me-2"></i>Learn More
                        </Link>
                    </div>
                </div>
            </div>

            <section className="stats-section py-5">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-6 col-md-3 mb-4">
                            <div className="h2 fw-bold mb-2">1,000+</div>
                            <p className="mb-0">Endangered Species</p>
                        </div>
                        <div className="col-6 col-md-3 mb-4">
                            <div className="h2 fw-bold mb-2">34</div>
                            <p className="mb-0">States Affected</p>
                        </div>
                        <div className="col-6 col-md-3 mb-4">
                            <div className="h2 fw-bold mb-2">15%</div>
                            <p className="mb-0">Species at Risk</p>
                        </div>
                        <div className="col-6 col-md-3 mb-4">
                            <div className="h2 fw-bold mb-2">2030</div>
                            <p className="mb-0">Target Year</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="featured-section">
                <div className="container">
                    <h2 className="text-center mb-5">Featured Endangered Species</h2>
                    {featuredSpecies && featuredSpecies.length > 0 ? (
                        <FeaturedSpeciesCarousel species={featuredSpecies} />
                    ) : (
                        <p className="text-center text-muted">Loading featured species...</p>
                    )}
                </div>
            </section>

            <div className="container conservation-container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="conservation-card">
                            <div className="card-body">
                                <h2 className="card-title text-center">
                                    <i className="bi bi-shield-check me-2"></i>
                                    Why Conservation Matters
                                </h2>
                                <p className="card-text text-center">
                                    Mexico's rich biodiversity faces unprecedented threats. Every endangered species represents a crucial link in our ecosystem's delicate balance. Through conservation efforts, education, and community involvement, we can protect these magnificent creatures and preserve Mexico's natural heritage for generations to come.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center g-4 mt-5">
                    <div className="col-12 col-md-4">
                        <div className="card sdg-card h-100">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="bi bi-water display-4"></i>
                                </div>
                                <h5 className="card-title">SDG 14: Life Below Water</h5>
                                <p className="card-text">
                                    Protecting our oceans and marine species such as the vaquita
                                    porpoise.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="card sdg-card h-100">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="bi bi-tree display-4"></i>
                                </div>
                                <h5 className="card-title">SDG 15: Life on Land</h5>
                                <p className="card-text">
                                    Conservation of vital ecosystems for species like the jaguar and
                                    Mexican wolf.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="card sdg-card h-100">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="bi bi-thermometer-sun display-4"></i>
                                </div>
                                <h5 className="card-title">Climate Action</h5>
                                <p className="card-text">
                                    Climate change is one of the greatest threats to biodiversity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="py-5 cta-section">
                <div className="container text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <h2 className="fw-bold mb-3">Take Action Today</h2>
                            <p className="lead mb-4">Every action counts in the fight to save Mexico's endangered species. Join thousands of conservationists making a difference.</p>
                            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                                <Link href="/catalog" className="btn btn-secondary btn-lg px-4">
                                    <i className="bi bi-binoculars me-2"></i>Explore Species
                                </Link>
                                <Link href="/learn" className="btn btn-outline-light btn-lg px-4">
                                    <i className="bi bi-heart me-2"></i>Support Conservation
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
