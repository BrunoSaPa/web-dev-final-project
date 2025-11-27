'use client';

import Link from 'next/link';

export default function SpeciesCard({ species }) {
    const s = species;
    // console.log('SpeciesCard received:', s.scientificName, s.statusLabel);

    const handleImageError = (e) => {
        e.currentTarget.src = '/images/default.png';
    };

    const getStatusColor = (status) => {
        const statusLower = (status || '').toLowerCase();
        if (statusLower.includes('critically')) return { badge: 'bg-danger', light: '#D32F2F', text: '#FFFFFF' };
        else if (statusLower.includes('endangered')) return { badge: 'bg-warning text-dark', light: '#F57C00', text: '#FFFFFF' };
        else if (statusLower.includes('vulnerable')) return { badge: 'bg-warning', light: '#FBC02D', text: '#212121' };
        else if (statusLower.includes('near threatened')) return { badge: 'bg-info', light: '#0097A7', text: '#FFFFFF' };
        else if (statusLower.includes('least concern')) return { badge: 'bg-success', light: '#388E3C', text: '#FFFFFF' };
        return { badge: 'bg-secondary', light: '#757575', text: '#FFFFFF' };
    };

    const statusColor = getStatusColor(s.statusLabel);

    return (
        <div className="col-12 col-sm-6 col-md-6 col-lg-4 mb-4">
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes hoverGlow {
                    0%, 100% {
                        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                    }
                    50% {
                        box-shadow: 0 1.5rem 2.5rem rgba(85, 139, 47, 0.25);
                    }
                }
                
                .species-card {
                    animation: slideUp 0.6s ease-out;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .species-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 1.5rem 2.5rem rgba(85, 139, 47, 0.25);
                }
                
                .card-img-wrapper {
                    position: relative;
                    overflow: hidden;
                    height: 250px;
                    background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
                }
                
                .card-img-wrapper img {
                    transition: transform 0.4s ease;
                    object-fit: cover;
                    width: 100%;
                    height: 100%;
                }
                
                .species-card:hover .card-img-wrapper img {
                    transform: scale(1.08) rotate(1deg);
                }
                
                .card-body {
                    background: linear-gradient(to bottom, #FFFFFF 0%, #F1F8E9 100%);
                }
                
                .card-title {
                    color: #1B5E20;
                    font-weight: 700;
                    font-size: 1.1rem;
                    line-height: 1.4;
                    transition: color 0.3s ease;
                }
                
                .species-card:hover .card-title {
                    color: #558B2F;
                }
                
                .scientific-name {
                    color: #1B5E20;
                    font-style: italic;
                    font-size: 0.95rem;
                    transition: color 0.3s ease;
                }
                
                .species-card:hover .scientific-name {
                    color: #33691E;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    animation: fadeIn 0.6s ease-out 0.2s both;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .btn-see-more {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    border: none;
                    color: white;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .btn-see-more::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.2);
                    transition: left 0.3s ease;
                }
                
                .btn-see-more:hover::before {
                    left: 100%;
                }
                
                .btn-see-more:hover {
                    transform: translateX(2px);
                    box-shadow: 0 0.5rem 1.5rem rgba(85, 139, 47, 0.4);
                }
            `}</style>

            <div className="card h-100 species-card border-0">
                <div className="card-img-wrapper">
                    <img
                        src={s.image}
                        alt={s.commonName || s.scientificName}
                        onError={handleImageError}
                    />
                </div>
                <div className="card-body d-flex flex-column">
                    {s.commonName && s.commonName !== s.scientificName ? (
                        <>
                            <h5 className="card-title mb-1">{s.commonName}</h5>
                            <p className="card-text scientific-name mb-2"><em>{s.scientificName}</em></p>
                        </>
                    ) : (
                        <h5 className="card-title mb-2">{s.scientificName}</h5>
                    )}
                    
                    <div className="mb-3">
                        <span className={`status-badge ${statusColor.badge}`} style={{ backgroundColor: statusColor.light, color: statusColor.text }}>
                            {s.statusLabel}
                        </span>
                    </div>

                    {s.estados && s.estados.length > 0 && (
                        <div className="mb-3 small text-muted">
                            <i className="bi bi-geo-alt-fill me-1 text-success"></i>
                            {s.estados.slice(0, 2).map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ')}
                            {s.estados.length > 2 && '...'}
                        </div>
                    )}

                    <Link
                        href={`/especie/${encodeURIComponent(s.scientificName)}`}
                        className="btn btn-see-more mt-auto fw-semibold"
                    >
                        <i className="bi bi-arrow-right me-2"></i>Discover
                    </Link>
                </div>
            </div>
        </div>
    );
}
