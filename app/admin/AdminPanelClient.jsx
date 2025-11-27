'use client'
import { useState, useEffect } from 'react'
import { apiCall } from '../../lib/apiUtils'

export default function AdminPanelClient({ session }) {
    const [pendingContributions, setPendingContributions] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)

    // Fetch pending contributions
    useEffect(() => {
        const fetchPendingContributions = async () => {
            try {
                setLoading(true)
                const response = await apiCall('/api/species?state=pending&limit=100')
                if (response.ok) {
                    const data = await response.json()
                    setPendingContributions(data.species || [])
                } else {
                    console.error('Failed to fetch pending contributions')
                }
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPendingContributions()
    }, [])

    const handleApproval = async (speciesId, action) => {
        if (processingId) return
        
        setProcessingId(speciesId)
        try {
            const response = await apiCall('/api/admin/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    speciesId,
                    action // 'approved' or 'rejected'
                })
            })
            
            if (response.ok) {
                //remove from pending list
                setPendingContributions(prev => 
                    prev.filter(species => species._id !== speciesId)
                )
                alert(`Species ${action} successfully!`)
            } else {
                const error = await response.json()
                alert('Error: ' + (error.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error processing approval:', error)
            alert('Error processing request')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading admin panel...</p>
            </div>
        )
    }

    return (
        <>
            <style>{`
                .admin-page {
                    background: linear-gradient(135deg, #F3E5F5 0%, #E8EAF6 100%);
                    min-height: 100vh;
                    padding: 3rem 0;
                }
                
                .admin-header {
                    color: #4A148C;
                    font-weight: 800;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .admin-card {
                    background: white;
                    border: 2px solid rgba(74, 20, 140, 0.2);
                    border-radius: 12px;
                    box-shadow: 0 1rem 2rem rgba(74, 20, 140, 0.1);
                }
                
                .species-card {
                    background: white;
                    border: 1px solid rgba(74, 20, 140, 0.1);
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }
                
                .species-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1rem rgba(74, 20, 140, 0.15);
                }
                
                .btn-approve {
                    background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
                    border: none;
                    color: white;
                    font-weight: 600;
                }
                
                .btn-reject {
                    background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
                    border: none;
                    color: white;
                    font-weight: 600;
                }
                
                .contributor-info {
                    background: rgba(74, 20, 140, 0.05);
                    border-radius: 6px;
                    padding: 0.5rem;
                }
            `}</style>
            
            <div className="admin-page">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="admin-card mb-4">
                                <div className="card-body text-center">
                                    <h1 className="admin-header mb-2">
                                        <i className="bi bi-shield-check me-3"></i>Admin Panel
                                    </h1>
                                    <p className="text-muted">
                                        Welcome, {session.user.name}. Manage species contributions below.
                                    </p>
                                    <div className="d-flex justify-content-center gap-3 mt-3">
                                        <div className="text-center">
                                            <div className="h4 mb-0 text-warning">{pendingContributions.length}</div>
                                            <small className="text-muted">Pending Review</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-12">
                            <div className="admin-card">
                                <div className="card-header">
                                    <h5 className="mb-0">
                                        <i className="bi bi-clock-history me-2"></i>
                                        Pending Species Contributions
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {pendingContributions.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-check-circle display-4 text-success"></i>
                                            <p className="text-muted mt-3">No pending contributions to review!</p>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {pendingContributions.map((species) => (
                                                <div key={species._id} className="col-12 mb-4">
                                                    <div className="species-card">
                                                        <div className="card-body">
                                                            <div className="row">
                                                                <div className="col-md-8">
                                                                    <div className="d-flex align-items-start mb-3">
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="mb-1 fw-bold text-primary">
                                                                                {species.nombre_comun || 'No common name'}
                                                                            </h6>
                                                                            <p className="text-muted fst-italic mb-2">
                                                                                {species.nombre_cientifico}
                                                                            </p>
                                                                            <div className="contributor-info mb-2">
                                                                                <small className="text-muted">
                                                                                    <i className="bi bi-person me-1"></i>
                                                                                    <strong>Contributor:</strong> {species.added_by}
                                                                                </small>
                                                                            </div>
                                                                            <div className="contributor-info mb-2">
                                                                                <small className="text-muted">
                                                                                    <i className="bi bi-calendar me-1"></i>
                                                                                    <strong>Submitted:</strong> {new Date(species.createdAt).toLocaleString()}
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="mb-3">
                                                                        <p className="mb-2">
                                                                            <strong>Description:</strong><br/>
                                                                            {species.descripcion || 'No description provided'}
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div className="row">
                                                                        <div className="col-sm-6">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-shield-exclamation me-1"></i>
                                                                                <strong>Status:</strong> {species.categoria_lista_roja}
                                                                            </small>
                                                                        </div>
                                                                        <div className="col-sm-6">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-geo-alt me-1"></i>
                                                                                <strong>Location:</strong> {species.top_lugares || 'Not specified'}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {(species.id_taxon_sis || species.inat_id || species.gbif_id) && (
                                                                        <div className="mt-2">
                                                                            <small className="text-muted">
                                                                                <strong>External IDs:</strong>
                                                                                {species.id_taxon_sis && ` Taxon SIS: ${species.id_taxon_sis}`}
                                                                                {species.inat_id && ` | iNaturalist: ${species.inat_id}`}
                                                                                {species.gbif_id && ` | GBIF: ${species.gbif_id}`}
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="col-md-4">
                                                                    {species.foto_principal && species.foto_principal !== '/images/default.png' ? (
                                                                        <img 
                                                                            src={species.foto_principal} 
                                                                            alt={species.nombre_comun}
                                                                            className="img-fluid rounded mb-3"
                                                                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                                        />
                                                                    ) : (
                                                                        <div 
                                                                            className="bg-light rounded d-flex align-items-center justify-content-center mb-3"
                                                                            style={{ height: '200px' }}
                                                                        >
                                                                            <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="d-grid gap-2">
                                                                        <button 
                                                                            className="btn btn-approve"
                                                                            onClick={() => handleApproval(species._id, 'approved')}
                                                                            disabled={processingId === species._id}
                                                                        >
                                                                            {processingId === species._id ? (
                                                                                <>
                                                                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                                                                    Processing...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <i className="bi bi-check-circle me-2"></i>
                                                                                    Approve
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                        <button 
                                                                            className="btn btn-reject"
                                                                            onClick={() => handleApproval(species._id, 'rejected')}
                                                                            disabled={processingId === species._id}
                                                                        >
                                                                            {processingId === species._id ? (
                                                                                <>
                                                                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                                                                    Processing...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <i className="bi bi-x-circle me-2"></i>
                                                                                    Reject
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}