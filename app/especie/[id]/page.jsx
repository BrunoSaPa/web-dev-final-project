import Link from 'next/link';
import { getSpeciesByScientificName, fetchEnciclovidaDetails } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function SpeciesDetail({ params }) {
    const { id } = params;
    const scientificName = decodeURIComponent(id);
    const localEntry = getSpeciesByScientificName(scientificName);

    if (!localEntry) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger">
                    Species not found in local catalog.
                </div>
                <Link href="/catalog" className="btn btn-primary">Back to Catalog</Link>
            </div>
        );
    }

    let pageData = {
        name: localEntry.nombre_cientifico,
        scientificName: localEntry.nombre_cientifico,
        image: '/images/default.png',
        region: null,
        habitat: null,
        threats: null,
        status: localEntry.categoria_lista_roja || 'No disponible',
        description: 'No se encontró información para esta especie en el catálogo local.'
    };

    try {
        const enc = await fetchEnciclovidaDetails(localEntry);
        pageData = {
            name: enc.commonName || localEntry.nombre_cientifico,
            scientificName: enc.scientificName || localEntry.nombre_cientifico,
            image: enc.image || '/images/default.png',
            region: enc.region || null,
            habitat: enc.habitat || null,
            threats: enc.threats || null,
            status: enc.statusLabel || localEntry.categoria_lista_roja || 'No disponible',
            description: enc.description || ''
        };
    } catch (error) {
        console.error('Error fetching details:', error);
    }

    return (
        <main className="flex-grow-1">
            <div className="container my-5">
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                        <li className="breadcrumb-item"><Link href="/catalog">Catalog</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">{pageData.name}</li>
                    </ol>
                </nav>

                <div className="row">
                    <div className="col-12 col-md-6 mb-4 mb-md-0">
                        <div className="card shadow-lg border-0">
                            <img src={pageData.image} className="card-img-top" alt={pageData.name} style={{ height: '500px', objectFit: 'cover' }} />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="card shadow-lg border-0 h-100">
                            <div className="card-body">
                                <h1 className="card-title template-text text-black mb-2">{pageData.name}</h1>
                                {pageData.scientificName && (
                                    <p className="text-muted fst-italic fs-5 mb-4"><i className="bi bi-book me-2"></i>{pageData.scientificName}</p>
                                )}

                                {pageData.status && (
                                    <div className="mb-4">
                                        {(() => {
                                            let badgeClass = 'bg-secondary';
                                            const statusLower = pageData.status.toLowerCase();
                                            if (statusLower.includes('critically')) badgeClass = 'bg-danger';
                                            else if (statusLower.includes('endangered')) badgeClass = 'bg-warning text-dark';
                                            else if (statusLower.includes('vulnerable')) badgeClass = 'bg-info';
                                            else if (statusLower.includes('near threatened')) badgeClass = 'bg-secondary';
                                            else if (statusLower.includes('least concern')) badgeClass = 'bg-success';
                                            return (
                                                <span className={`badge ${badgeClass} fs-6 px-3 py-2`}>
                                                    <i className="bi bi-shield-check me-2"></i>{pageData.status}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                )}

                                {pageData.description && (
                                    <div className="mb-4">
                                        <h5 className="border-bottom pb-2"><i className="bi bi-info-circle me-2"></i>Description</h5>
                                        <p className="text-muted">{pageData.description}</p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h5 className="border-bottom pb-2"><i className="bi bi-list-ul me-2"></i>Species Information</h5>
                                    <ul className="list-group list-group-flush">
                                        {pageData.region && (
                                            <li className="list-group-item list-template d-flex align-items-start">
                                                <i className="bi bi-geo-alt-fill me-2 text-primary mt-1"></i>
                                                <div><strong>Region:</strong> {pageData.region}</div>
                                            </li>
                                        )}
                                        {pageData.habitat && (
                                            <li className="list-group-item list-template d-flex align-items-start">
                                                <i className="bi bi-tree-fill me-2 text-success mt-1"></i>
                                                <div><strong>Habitat:</strong> {pageData.habitat}</div>
                                            </li>
                                        )}
                                        {pageData.threats && (
                                            <li className="list-group-item list-template d-flex align-items-start">
                                                <i className="bi bi-exclamation-triangle-fill me-2 text-danger mt-1"></i>
                                                <div><strong>Threats:</strong> {pageData.threats}</div>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="d-flex gap-2 flex-wrap">
                                    <Link href="/catalog" className="btn btn-primary">
                                        <i className="bi bi-arrow-left me-2"></i>Back to Catalog
                                    </Link>
                                    <Link href="/" className="btn btn-outline-secondary">
                                        <i className="bi bi-house-fill me-2"></i>Home
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
