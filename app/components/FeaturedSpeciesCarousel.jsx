'use client';

import Link from 'next/link';

// Featured species carousel - displays highlighted species on homepage
export default function FeaturedSpeciesCarousel({ species }) {
    // Handle missing or broken species images
    const handleImageError = (e) => {
        e.currentTarget.src = '/images/default.png';
    };

    return (
        <>
            <style>{`
                .carousel-wrapper {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                    border: 2px solid #F1F8E9;
                }
                
                #speciesCarousel {
                    border-radius: 20px;
                    overflow: hidden;
                }
                
                .carousel-inner {
                    border-radius: 20px;
                }
                
                .carousel-item {
                    padding: 2.5rem;
                    min-height: 500px;
                }
                
                .carousel-content-wrapper {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    width: 100%;
                }
                
                .carousel-item .col-md-6:first-child img {
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(85, 139, 47, 0.15);
                    transition: transform 0.4s ease;
                }
                
                .carousel-item:hover .col-md-6:first-child img {
                    transform: scale(1.02);
                }
                
                .carousel-item h3 {
                    color: #1B5E20;
                    font-weight: 800;
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.2;
                }
                
                .carousel-item .text-muted {
                    color: #1B5E20 !important;
                    font-size: 1.15rem;
                    font-weight: 500;
                    margin-bottom: 1rem !important;
                }
                
                .carousel-item .lead {
                    color: #1B5E20;
                    font-size: 1.05rem;
                    line-height: 1.8;
                    margin-bottom: 1.5rem;
                }
                
                .carousel-item .badge {
                    padding: 0.6rem 1.2rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-radius: 20px;
                }
                
                .carousel-indicators {
                    bottom: -60px;
                    margin-bottom: 0;
                }
                
                .carousel-indicators button {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background-color: rgba(85, 139, 47, 0.3);
                    border: none;
                    margin: 0 6px;
                    transition: all 0.3s ease;
                    opacity: 1;
                }
                
                .carousel-indicators button.active {
                    background-color: #558B2F;
                    width: 12px;
                    transform: scale(1.2);
                }
                
                .carousel-indicators button:hover {
                    background-color: rgba(85, 139, 47, 0.6);
                }
                
                .carousel-control-prev,
                .carousel-control-next {
                    width: 50px;
                    height: 50px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(85, 139, 47, 0.8);
                    border-radius: 50%;
                    opacity: 0;
                    transition: opacity 0.3s ease, background 0.3s ease;
                }
                
                .carousel-wrapper:hover .carousel-control-prev,
                .carousel-wrapper:hover .carousel-control-next {
                    opacity: 1;
                }
                
                .carousel-control-prev:hover,
                .carousel-control-next:hover {
                    background: rgba(85, 139, 47, 1);
                }
                
                .carousel-control-prev {
                    left: 20px;
                }
                
                .carousel-control-next {
                    right: 20px;
                }
                
                .carousel-control-prev-icon,
                .carousel-control-next-icon {
                    width: 20px;
                    height: 20px;
                    background-size: 100%;
                    filter: brightness(0) invert(1);
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    border: none;
                    color: white;
                    font-weight: 700;
                    padding: 0.7rem 2rem;
                    border-radius: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(85, 139, 47, 0.3);
                }
                
                .btn-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(85, 139, 47, 0.4);
                    background: linear-gradient(135deg, #33691E 0%, #1B5E20 100%);
                }
                
                @media (max-width: 768px) {
                    .carousel-item {
                        padding: 1.5rem;
                        min-height: auto;
                    }
                    
                    .carousel-content-wrapper {
                        flex-direction: column;
                    }
                    
                    .carousel-item h3 {
                        font-size: 1.5rem;
                    }
                    
                    .carousel-indicators {
                        bottom: -50px;
                        margin-bottom: 0;
                        justify-content: center;
                    }
                    
                    .carousel-indicators button {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background-color: rgba(85, 139, 47, 0.3);
                        border: none;
                        margin: 0 6px;
                        transition: all 0.3s ease;
                        opacity: 1;
                    }
                    
                    .carousel-indicators button.active {
                        background-color: #558B2F;
                        width: 12px;
                        transform: scale(1.2);
                    }
                }
            `}</style>

            <div className="carousel-wrapper">
                <div id="speciesCarousel" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-indicators">
                        {species.map((s, index) => (
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
                        {species.map((s, index) => (
                            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                <div className="carousel-content-wrapper">
                                    <div className="row align-items-center w-100 m-0">
                                        <div className="col-md-6 mb-4 mb-md-0">
                                            <img
                                                src={s.image}
                                                className="d-block w-100"
                                                alt={s.commonName}
                                                style={{ maxHeight: '450px', objectFit: 'cover' }}
                                                onError={handleImageError}
                                            />
                                        </div>
                                        <div className="col-md-6 ps-md-4">
                                            <h3>
                                                {s.commonName && s.commonName !== s.scientificName
                                                    ? s.commonName
                                                    : s.scientificName}
                                            </h3>
                                            {s.commonName && s.commonName !== s.scientificName && (
                                                <p className="text-muted mb-3"><em>{s.scientificName}</em></p>
                                            )}
                                            {s.description ? (
                                                <p className="lead">
                                                    {s.description.substring(0, 250)}
                                                    {s.description.length > 250 ? '...' : ''}
                                                </p>
                                            ) : (
                                                <p className="lead">An endangered species found in Mexico.</p>
                                            )}
                                            <div className="mb-4">
                                                {(() => {
                                                    let badgeClass = 'bg-danger';
                                                    const status = (s.statusLabel || '').toLowerCase();
                                                    if (status.includes('critically')) badgeClass = 'bg-danger';
                                                    else if (status.includes('endangered')) badgeClass = 'bg-warning text-dark';
                                                    else if (status.includes('vulnerable')) badgeClass = 'bg-info';
                                                    else if (status.includes('near threatened')) badgeClass = 'bg-secondary';
                                                    else if (status.includes('least concern')) badgeClass = 'bg-success';
                                                    return <span className={`badge ${badgeClass} me-2`}>{s.statusLabel}</span>;
                                                })()}
                                            </div>
                                            <Link href={`/especie/${encodeURIComponent(s.scientificName)}`} className="btn btn-primary">
                                                <i className="bi bi-arrow-right me-2"></i>Learn More
                                            </Link>
                                        </div>
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
            </div>
        </>
    );
}
