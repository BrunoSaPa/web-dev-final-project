import Link from 'next/link';
import { getSpecies } from '../../lib/api';
import SpeciesCard from '../components/SpeciesCard';
import SpeciesFilters from '../components/SpeciesFilters';

export const dynamic = 'force-dynamic'; // Ensure searchParams are handled correctly

export default async function Catalog({ searchParams }) {
    const params = await searchParams;
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 15;
    const statusParam = params.status;
    const status = statusParam && statusParam.trim() !== '' ? statusParam : null;
    const searchParam = params.search;
    const search = searchParam && searchParam.trim() !== '' ? searchParam : null;
    const estado = params.estado || null;
    const reino = params.reino || null;
    const filo = params.filo || null;
    const clase = params.clase || null;
    const orden = params.orden || null;
    const familia = params.familia || null;

    const { species, pagination } = await getSpecies({ 
        page, 
        limit, 
        status, 
        search,
        estado,
        reino,
        filo,
        clase,
        orden,
        familia
    });
    const currentFilter = status || 'all';

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)' }}>
            <style>{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .catalog-header {
                    animation: fadeInDown 0.8s ease-out;
                    color: #1B5E20;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    font-weight: 800;
                    font-size: 3rem;
                }
                
                .pagination-container {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    margin: 4rem 0;
                }
                
                .btn-pagination {
                    padding: 0.7rem 1.5rem;
                    font-weight: 600;
                    font-size: 1rem;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    border: 2px solid #558B2F;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .btn-pagination.btn-prev,
                .btn-pagination.btn-next {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    color: white;
                }
                
                .btn-pagination.btn-prev:hover,
                .btn-pagination.btn-next:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 0.5rem 1.5rem rgba(85, 139, 47, 0.3);
                }
                
                .btn-pagination:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #E8EAE6;
                    color: #9CCC65;
                    border-color: #DEE2B6;
                }
                
                .btn-pagination.btn-page-info {
                    background: white;
                    color: #558B2F;
                    font-weight: 700;
                    border: 2px solid #558B2F;
                }
                
                .container-catalog {
                    background: white;
                    border-radius: 16px;
                    padding: 3rem 2rem;
                    margin-top: -2rem;
                    box-shadow: 0 1.5rem 3rem rgba(27, 94, 32, 0.1);
                    position: relative;
                    z-index: 1;
                }
                
                .catalog-subtitle {
                    font-size: 0.95rem;
                    color: #558B2F;
                    font-style: italic;
                    margin-bottom: 2rem;
                    font-weight: 500;
                }
                
                .alert-custom {
                    background: linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%);
                    border: 2px dashed #FF9800;
                    border-radius: 12px;
                    color: #E65100;
                }
                
                .alert-custom h4 {
                    color: #E65100;
                    font-weight: 700;
                }
                
                .alert-custom .btn {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    color: white;
                    border: none;
                }
            `}</style>

            {/* Header Section */}
            <div className="py-5">
                <div className="container">
                    <h1 className="text-center catalog-header mb-2">
                        <i className="bi bi-flower2 me-3"></i>Species Catalog
                    </h1>
                    <p className="text-center catalog-subtitle">
                        Discover and explore endangered species from Mexico
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-fluid px-3 px-md-5 pb-5">
                <div className="container-catalog">
                    {/* Filters */}
                    <div className="mb-5">
                        <SpeciesFilters 
                            currentStatus={status}
                            currentSearch={search}
                            currentPage={page}
                            currentEstado={estado}
                            currentReino={reino}
                            currentFilo={filo}
                            currentClase={clase}
                            currentOrden={orden}
                            currentFamilia={familia}
                        />
                    </div>

                    {/* Results Grid */}
                    <div className="row">
                        {species && species.length > 0 ? (
                            species.map((s, index) => (
                                <SpeciesCard key={index} species={s} />
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="alert alert-custom text-center" role="alert">
                                    <h4 className="mb-2">
                                        <i className="bi bi-search me-2"></i>No species found
                                    </h4>
                                    <p className="mb-3">The selected filters didn't match any species. Try adjusting your search criteria or filters.</p>
                                    <Link href="/catalog" className="btn btn-gradient px-4 py-2">
                                        <i className="bi bi-arrow-clockwise me-2"></i>Reset Filters
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="pagination-container">
                            {(() => {
                                const prevPage = pagination.page - 1;
                                const nextPage = pagination.page + 1;

                                // Helper to build URL with all filters
                                const buildUrl = (p) => {
                                    const query = new URLSearchParams();
                                    query.set('page', p);
                                    if (pagination.limit && parseInt(pagination.limit) !== 15) query.set('limit', pagination.limit);
                                    if (pagination.status) query.set('status', pagination.status);
                                    if (search) query.set('search', search);
                                    if (estado) query.set('estado', estado);
                                    if (reino) query.set('reino', reino);
                                    if (filo) query.set('filo', filo);
                                    if (clase) query.set('clase', clase);
                                    if (orden) query.set('orden', orden);
                                    if (familia) query.set('familia', familia);
                                    return `/catalog?${query.toString()}`;
                                };

                                return (
                                    <>
                                        {pagination.page > 1 ? (
                                            <Link
                                                className="btn-pagination btn-prev"
                                                href={buildUrl(prevPage)}
                                            >
                                                <i className="bi bi-chevron-left"></i>Previous
                                            </Link>
                                        ) : (
                                            <button type="button" className="btn-pagination btn-prev" disabled>
                                                <i className="bi bi-chevron-left"></i>Previous
                                            </button>
                                        )}
                                        <button type="button" className="btn-pagination btn-page-info" disabled>
                                            <i className="bi bi-bookmark-fill me-2"></i>Page {pagination.page} of {pagination.totalPages}
                                        </button>
                                        {pagination.page < pagination.totalPages ? (
                                            <Link
                                                className="btn-pagination btn-next"
                                                href={buildUrl(nextPage)}
                                            >
                                                Next<i className="bi bi-chevron-right"></i>
                                            </Link>
                                        ) : (
                                            <button type="button" className="btn-pagination btn-next" disabled>
                                                Next<i className="bi bi-chevron-right"></i>
                                            </button>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
