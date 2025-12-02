'use client'
import { useState, useEffect } from 'react'
import { apiCall } from '../../lib/apiUtils'

// Admin panel component for reviewing and approving user-submitted species
export default function AdminPanelClient({ session }) {
    // State for pending submissions and UI
    const [pendingContributions, setPendingContributions] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)

    // Fetch pending species contributions on component mount
    useEffect(() => {
        const fetchPendingContributions = async () => {
            try {
                setLoading(true)
                // Query for species with pending state
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

    // Handle approval or rejection of a species submission
    const handleApproval = async (speciesId, action) => {
        // Prevent multiple simultaneous requests
        if (processingId) return
        
        setProcessingId(speciesId)
        try {
            // Send approval/rejection to backend
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
                // Remove species from pending list after approval/rejection
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
                    background-color: #f8f9fa;
                    min-height: 100vh;
                    padding: 3rem 0;
                }
                
                .admin-header-card {
                    background: white;
                    border: none;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                    overflow: hidden;
                }

                .admin-header-bg {
                    background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
                    padding: 3rem 2rem;
                    color: white;
                    position: relative;
                }

                .admin-header-bg::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }
                
                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    padding: 1rem 2rem;
                    display: inline-block;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2c3e50;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .species-card {
                    background: white;
                    border: none;
                    border-radius: 16px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    overflow: hidden;
                    height: 100%;
                }
                
                .species-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                }

                .species-image-container {
                    height: 240px;
                    overflow: hidden;
                    position: relative;
                    background-color: #f1f3f5;
                }

                .species-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .species-card:hover .species-image {
                    transform: scale(1.05);
                }

                .species-content {
                    padding: 1.5rem;
                }

                .species-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2c3e50;
                    margin-bottom: 0.25rem;
                }

                .species-subtitle {
                    font-family: 'Georgia', serif;
                    font-style: italic;
                    color: #6c757d;
                    margin-bottom: 1rem;
                }

                .info-badge {
                    background: #f8f9fa;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: #495057;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .description-box {
                    background: #fff;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                    font-size: 0.9rem;
                    color: #495057;
                    max-height: 100px;
                    overflow-y: auto;
                }

                .action-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e9ecef;
                }
                
                .btn-approve {
                    background-color: #2E7D32;
                    color: white;
                    border: none;
                    padding: 0.75rem;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }

                .btn-approve:hover {
                    background-color: #1B5E20;
                    color: white;
                }
                
                .btn-reject {
                    background-color: #fff;
                    color: #c62828;
                    border: 1px solid #ef9a9a;
                    padding: 0.75rem;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .btn-reject:hover {
                    background-color: #ffebee;
                    color: #b71c1c;
                }

                .empty-state {
                    text-center: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                }

                .empty-icon {
                    font-size: 4rem;
                    color: #e9ecef;
                    margin-bottom: 1.5rem;
                }
            `}</style>
            
            <div className="admin-page">
                <div className="container">
                    <div className="admin-header-card">
                        <div className="admin-header-bg">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <h1 className="fw-bold mb-2">Admin Dashboard</h1>
                                    <p className="mb-0 opacity-75">
                                        Welcome back, {session.user.name}
                                    </p>
                                </div>
                                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                    <div className="stat-card">
                                        <div className="h2 mb-0 fw-bold">{pendingContributions.length}</div>
                                        <small className="opacity-75">Pending Reviews</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h2 className="section-title">
                        <i className="bi bi-clock-history text-warning"></i>
                        Pending Contributions
                    </h2>

                    {pendingContributions.length === 0 ? (
                        <div className="empty-state">
                            <i className="bi bi-check-circle empty-icon text-success"></i>
                            <h3>All Caught Up!</h3>
                            <p className="text-muted">There are no pending contributions to review at this time.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {pendingContributions.map((species) => (
                                <div key={species._id} className="col-lg-6 col-xl-4">
                                    <div className="species-card h-100 d-flex flex-column">
                                        <div className="species-image-container">
                                            {species.foto_principal && species.foto_principal !== '/images/default.png' ? (
                                                <img 
                                                    src={species.foto_principal} 
                                                    alt={species.nombre_comun}
                                                    className="species-image"
                                                />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                                                    <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                                                </div>
                                            )}
                                            <div className="position-absolute top-0 end-0 m-3">
                                                <span className="badge bg-warning text-dark shadow-sm">
                                                    Pending Review
                                                </span>
                                            </div>
                                        </div>

                                        <div className="species-content flex-grow-1 d-flex flex-column">
                                            <h3 className="species-title">
                                                {species.nombre_comun || 'No common name'}
                                            </h3>
                                            <div className="species-subtitle">
                                                {species.nombre_cientifico}
                                            </div>

                                            <div className="info-badge">
                                                <i className="bi bi-person-circle text-primary"></i>
                                                <span className="text-truncate">{species.added_by}</span>
                                            </div>

                                            <div className="info-badge">
                                                <i className="bi bi-calendar-event text-primary"></i>
                                                <span>{new Date(species.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            <div className="description-box custom-scrollbar">
                                                {species.descripcion || 'No description provided'}
                                            </div>

                                            <div className="mt-auto">
                                                <div className="d-flex gap-2 mb-3 flex-wrap">
                                                    <span className="badge bg-light text-dark border">
                                                        <i className="bi bi-shield-exclamation me-1"></i>
                                                        {species.categoria_lista_roja}
                                                    </span>
                                                    {species.top_lugares && (
                                                        <span className="badge bg-light text-dark border" title={species.top_lugares}>
                                                            <i className="bi bi-geo-alt me-1"></i>
                                                            Location Info
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn btn-reject"
                                                        onClick={() => handleApproval(species._id, 'rejected')}
                                                        disabled={processingId === species._id}
                                                    >
                                                        {processingId === species._id ? '...' : 'Reject'}
                                                    </button>
                                                    <button 
                                                        className="btn btn-approve"
                                                        onClick={() => handleApproval(species._id, 'approved')}
                                                        disabled={processingId === species._id}
                                                    >
                                                        {processingId === species._id ? 'Processing...' : 'Approve'}
                                                    </button>
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
        </>
    )
}