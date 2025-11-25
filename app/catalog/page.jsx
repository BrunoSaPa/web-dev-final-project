import Link from 'next/link';
import { getSpecies } from '../../lib/api';

export const dynamic = 'force-dynamic'; // Ensure searchParams are handled correctly

export default async function Catalog({ searchParams }) {
    const page = parseInt(searchParams.page) || 1;
    const limit = parseInt(searchParams.limit) || 15;
    const status = searchParams.status || null;

    const { species, pagination } = await getSpecies({ page, limit, status });
    const currentFilter = status || 'all';

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4 catalog-text">Species Catalog</h2>

            {/* Filter Buttons */}
            <div className="text-center mb-4">
                <h5 className="mb-3">Filter by Conservation Status:</h5>
                <div className="btn-group flex-wrap justify-content-center gap-2" role="group">
                    <Link href="/catalog?status=" className={`btn ${currentFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}>All Species</Link>
                    <Link href="/catalog?status=Critically Endangered" className={`btn ${currentFilter === 'Critically Endangered' ? 'btn-primary' : 'btn-outline-secondary'}`}>Critically Endangered</Link>
                    <Link href="/catalog?status=Endangered" className={`btn ${currentFilter === 'Endangered' ? 'btn-primary' : 'btn-outline-secondary'}`}>Endangered</Link>
                    <Link href="/catalog?status=Vulnerable" className={`btn ${currentFilter === 'Vulnerable' ? 'btn-primary' : 'btn-outline-secondary'}`}>Vulnerable</Link>
                    <Link href="/catalog?status=Near Threatened" className={`btn ${currentFilter === 'Near Threatened' ? 'btn-primary' : 'btn-outline-secondary'}`}>Near Threatened</Link>
                    <Link href="/catalog?status=Least Concern" className={`btn ${currentFilter === 'Least Concern' ? 'btn-primary' : 'btn-outline-secondary'}`}>Least Concern</Link>
                </div>
            </div>

            {currentFilter && currentFilter !== 'all' && (
                <div className="alert alert-info text-center">
                    Showing species with status: <strong>{currentFilter}</strong>
                </div>
            )}

            <div className="row">
                {species && species.length > 0 ? (
                    species.map((s, index) => (
                        <div key={index} className="col-12 col-sm-6 col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow">
                                <img src={s.image} className="card-img-top" alt={s.commonName} style={{ height: '250px', objectFit: 'cover' }} />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{s.commonName}</h5>
                                    <p className="card-text text-muted small"><em>{s.scientificName}</em></p>
                                    {(() => {
                                        let badgeClass = 'bg-secondary';
                                        const statusLower = (s.statusLabel || '').toLowerCase();
                                        if (statusLower.includes('critically')) badgeClass = 'bg-danger';
                                        else if (statusLower.includes('endangered')) badgeClass = 'bg-warning';
                                        else if (statusLower.includes('vulnerable')) badgeClass = 'bg-info';
                                        else if (statusLower.includes('near threatened')) badgeClass = 'bg-secondary';
                                        else if (statusLower.includes('least concern')) badgeClass = 'bg-success';
                                        return <p className="card-text"><span className={`badge ${badgeClass}`}>{s.statusLabel}</span></p>;
                                    })()}
                                    <Link href={`/especie/${encodeURIComponent(s.scientificName)}`} className="btn btn-primary mt-auto">See more</Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="alert alert-warning text-center" role="alert">
                            <h4>No species found</h4>
                            <p>No species match the selected filter. Try selecting a different conservation status.</p>
                            <Link href="/catalog" className="btn btn-primary">View All Species</Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center my-4">
                    {(() => {
                        const prevPage = pagination.page - 1;
                        const nextPage = pagination.page + 1;
                        const params = [];
                        if (pagination.limit && parseInt(pagination.limit) !== 15) {
                            params.push(`limit=${parseInt(pagination.limit)}`);
                        }
                        if (pagination.status) {
                            params.push(`status=${encodeURIComponent(pagination.status)}`);
                        }
                        const suffix = params.length > 0 ? `&${params.join('&')}` : ''; // Use & because we append to ?page=... or construct full query

                        // Helper to build URL
                        const buildUrl = (p) => {
                            const query = new URLSearchParams();
                            query.set('page', p);
                            if (pagination.limit && parseInt(pagination.limit) !== 15) query.set('limit', pagination.limit);
                            if (pagination.status) query.set('status', pagination.status);
                            return `/catalog?${query.toString()}`;
                        };

                        return (
                            <div className="btn-group" role="group">
                                <Link
                                    className={`btn btn-outline-primary ${pagination.page <= 1 ? 'disabled' : ''}`}
                                    href={pagination.page <= 1 ? '#' : buildUrl(prevPage)}
                                    aria-disabled={pagination.page <= 1}
                                >
                                    Previous
                                </Link>
                                <button type="button" className="btn btn-light" disabled>Page {pagination.page} of {pagination.totalPages}</button>
                                <Link
                                    className={`btn btn-outline-primary ${pagination.page >= pagination.totalPages ? 'disabled' : ''}`}
                                    href={pagination.page >= pagination.totalPages ? '#' : buildUrl(nextPage)}
                                    aria-disabled={pagination.page >= pagination.totalPages}
                                >
                                    Next
                                </Link>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
