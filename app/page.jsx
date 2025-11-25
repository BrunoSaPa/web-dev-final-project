import Link from 'next/link';
import { getAllSpecies, fetchEnciclovidaDetails } from '../lib/api';

export const dynamic = 'force-dynamic'; // Ensure random species are generated on each request

export default async function Home() {
    const iucnSpeciesData = getAllSpecies();

    // Get 3 random species
    const shuffled = [...iucnSpeciesData].sort(() => 0.5 - Math.random());
    const randomSpecies = shuffled.slice(0, 3);

    // Fetch details for each random species
    const featuredSpecies = await Promise.all(
        randomSpecies.map(species => fetchEnciclovidaDetails(species))
    );

    return (
        <>
            <div className="main-container">
                <img
                    src="/images/hero-image.jpg"
                    alt="landscape."
                    className="background-image"
                />

                <div className="overlay"></div>

                <div className="content-container">
                    <div className="hero-section">
                        <div className="hero-content">
                            <h1 className="display-3 fw-bold mb-4">Protecting Mexico's Endangered Species</h1>
                            <p className="lead mb-4" style={{ color: 'var(--background-color)' }}>Mexico is home to over 1,000 endangered species. Join us in conservation efforts to protect biodiversity and preserve our natural heritage for future generations.</p>
                            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                                <Link href="/catalog" className="btn btn-primary btn-lg px-4">
                                    <i className="bi bi-search me-2"></i>Explore Species
                                </Link>
                                <Link href="/learn" className="btn btn-outline-light btn-lg px-4">
                                    <i className="bi bi-book me-2"></i>Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="py-5" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--fourth-color)' }}>
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

            <section className="py-5">
                <div className="container">
                    <h2 className="text-center mb-5">Featured Endangered Species</h2>
                    {featuredSpecies && featuredSpecies.length > 0 ? (
                        <div id="speciesCarousel" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-indicators">
                                {featuredSpecies.map((species, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        data-bs-target="#speciesCarousel"
                                        data-bs-slide-to={index}
                                        className={index === 0 ? 'active' : ''}
                                        aria-current={index === 0 ? 'true' : 'false'}
                                        aria-label={`Slide ${index + 1}`}
                                    ></button>
                                ))}
                            </div>
                            <div className="carousel-inner">
                                {featuredSpecies.map((species, index) => (
                                    <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                        <div className="row align-items-center">
                                            <div className="col-md-6">
                                                <img
                                                    src={species.image}
                                                    className="d-block w-100 rounded"
                                                    alt={species.commonName}
                                                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <h3 className="fw-bold mb-3">{species.commonName}</h3>
                                                <p className="text-muted mb-2"><em>{species.scientificName}</em></p>
                                                {species.description ? (
                                                    <p className="lead">
                                                        {species.description.substring(0, 200)}
                                                        {species.description.length > 200 ? '...' : ''}
                                                    </p>
                                                ) : (
                                                    <p className="lead">An endangered species found in Mexico.</p>
                                                )}
                                                <div className="mb-3">
                                                    {(() => {
                                                        let badgeClass = 'bg-secondary';
                                                        const status = (species.statusLabel || '').toLowerCase();
                                                        if (status.includes('critically')) badgeClass = 'bg-danger';
                                                        else if (status.includes('endangered')) badgeClass = 'bg-warning';
                                                        else if (status.includes('vulnerable')) badgeClass = 'bg-info';
                                                        else if (status.includes('near threatened')) badgeClass = 'bg-warning'; // EJS had warning for near threatened too? Let's check.
                                                        // EJS line 84: else if (status.includes('near threatened')) badgeClass = 'bg-warning';
                                                        // Wait, catalog.ejs line 50 says: else if (status.includes('near threatened')) badgeClass = 'bg-secondary';
                                                        // I'll stick to EJS homepage logic for homepage, but maybe consistency is better.
                                                        // I'll use what was in homepage.ejs.
                                                        return <span className={`badge ${badgeClass} me-2`}>{species.statusLabel}</span>;
                                                    })()}
                                                </div>
                                                <Link href={`/especie/${encodeURIComponent(species.scientificName)}`} className="btn btn-primary">
                                                    Learn More
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target="#speciesCarousel" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#speciesCarousel" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    ) : (
                        <p className="text-center">Loading featured species...</p>
                    )}
                </div>
            </section>

            <div className="container">
                <div className="row justify-content-center my-5">
                    <div className="col-md-8">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title text-center mb-3">
                                    <i className="bi bi-shield-check me-2" style={{ color: 'var(--secondary-color)' }}></i>
                                    Why Conservation Matters
                                </h2>
                                <p className="card-text">
                                    Mexico's rich biodiversity faces unprecedented threats. Every endangered species represents a crucial link in our ecosystem's delicate balance. Through conservation efforts, education, and community involvement, we can protect these magnificent creatures and preserve Mexico's natural heritage for generations to come.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row text-center g-4 mb-5">
                    <div className="col-12 col-md-4">
                        <div className="card h-100 shadow border-0">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="bi bi-water display-4" style={{ color: 'var(--secondary-color)' }}></i>
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
                        <div className="card h-100 shadow border-0">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="bi bi-tree display-4" style={{ color: 'var(--primary-color)' }}></i>
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
                        <div className="card h-100 shadow border-0">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <i className="bi bi-thermometer-sun display-4" style={{ color: 'var(--third-color)' }}></i>
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

            <section className="py-5" style={{ backgroundColor: 'var(--third-color)', color: 'var(--fourth-color)' }}>
                <div className="container text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <h2 className="fw-bold mb-3" style={{ color: 'var(--fourth-color)' }}>Take Action Today</h2>
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
