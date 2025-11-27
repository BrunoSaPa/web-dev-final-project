'use client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import { apiCall } from '../../lib/apiUtils'

export default function Profile() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/api/auth/signin')
        },
    })
    

    console.log('Profile page session:', { status, session });

    const [activeTab, setActiveTab] = useState('profile')
    const [contributionForm, setContributionForm] = useState({
        nombre_cientifico: '',
        nombre_comun: '',
        categoria_lista_roja: 'Vulnerable',
        descripcion: '',
        foto_principal: '',
        fotos: [],
        id_taxon_sis: '',
        inat_id: '',
        gbif_id: '',
        top_lugares: '',
        added_by: '',
        state: 'pending'
    })

    const [contributions, setContributions] = useState([])
    const [loading, setLoading] = useState(true)

    //fetch from database
    useEffect(() => {
        const fetchUserContributions = async () => {
            if (!session?.user?.email) return
            
            try {
                setLoading(true)
                const response = await fetch(`/api/species?added_by=${encodeURIComponent(session.user.email)}&limit=100`)
                if (response.ok) {
                    const data = await response.json()
                    setContributions(data.species || [])
                } else {
                    console.error('Failed to fetch contributions')
                    setContributions([])
                }
            } catch (error) {
                console.error('Error fetching contributions:', error)
                setContributions([])
            } finally {
                setLoading(false)
            }
        }

        fetchUserContributions()
    }, [session?.user?.email])

    const handleSubmitContribution = async (e) => {
        e.preventDefault()
        const submissionData = {
            ...contributionForm,
            added_by: session?.user?.email || 'anonymous',
            state: 'pending'
        }
        
        try {
            const response = await apiCall('/api/species', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            })
            
            if (response.ok) {
                alert('Species contribution submitted! It will be reviewed by our conservation team.')
                //reset form
                setContributionForm({
                    nombre_cientifico: '',
                    nombre_comun: '',
                    categoria_lista_roja: 'Vulnerable',
                    descripcion: '',
                    foto_principal: '',
                    fotos: [],
                    id_taxon_sis: '',
                    inat_id: '',
                    gbif_id: '',
                    top_lugares: '',
                    added_by: '',
                    state: 'pending'
                })
                // Refresh contributions
                const contributionsResponse = await apiCall(`/api/species?added_by=${encodeURIComponent(session.user.email)}&limit=100`)
                if (contributionsResponse.ok) {
                    const data = await contributionsResponse.json()
                    setContributions(data.species || [])
                }
                setActiveTab('contributions')
            } else {
                const error = await response.json()
                alert('Error submitting species: ' + (error.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error submitting contribution:', error)
            alert('Error submitting species. Please try again.')
        }
    }

    if (status === 'loading') {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    const getStatusBadge = (state) => {
        switch (state) {
            case 'approved':
                return <span className="badge bg-success">Approved</span>
            case 'rejected':
                return <span className="badge bg-danger">Rejected</span>
            case 'pending':
                return <span className="badge bg-warning text-dark">Pending Review</span>
            default:
                return <span className="badge bg-secondary">Unknown</span>
        }
    }

    const getContributionIcon = (type) => {
        switch (type) {
            case 'research':
                return <i className="bi bi-search text-primary"></i>
            case 'habitat':
                return <i className="bi bi-tree-fill text-success"></i>
            case 'education':
                return <i className="bi bi-book text-info"></i>
            case 'protection':
                return <i className="bi bi-shield-check text-warning"></i>
            default:
                return <i className="bi bi-heart text-danger"></i>
        }
    }

    return (
        <>
            <style>{`
                .profile-page {
                    background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 100%);
                    min-height: 100vh;
                    padding: 3rem 0;
                }
                
                .profile-header-card {
                    background: white;
                    border: 2px solid rgba(85, 139, 47, 0.2);
                    border-radius: 12px;
                }
                
                .profile-header-card h4 {
                    color: #1B5E20 !important;
                }
                
                .profile-header-card p {
                    color: #558B2F;
                }
                
                .nav-tabs {
                    border-bottom: 2px solid rgba(85, 139, 47, 0.2) !important;
                }
                
                .nav-tabs .nav-link {
                    color: #558B2F !important;
                    border: none;
                    transition: all 0.3s ease;
                }
                
                .nav-tabs .nav-link:hover {
                    color: #1B5E20 !important;
                    border-bottom: 3px solid #558B2F !important;
                }
                
                .nav-tabs .nav-link.active {
                    color: #1B5E20 !important;
                    background-color: transparent;
                    border-bottom: 3px solid #558B2F !important;
                }
                
                .profile-card {
                    background: white;
                    border: 2px solid rgba(85, 139, 47, 0.2);
                    border-radius: 12px;
                }
                
                .profile-card .card-header {
                    background: transparent;
                    border-bottom: 2px solid rgba(85, 139, 47, 0.2);
                }
                
                .stats-item h5 {
                    color: #558B2F;
                }
            `}</style>
            
            <div className="profile-page">
                <div className="container">
                    <div className="row">
                        {/* Profile Header */}
                        <div className="col-12">
                            <div className="card shadow-sm profile-header-card mb-4">
                                <div className="card-body text-center">
                                    {session.user?.image ? (
                                        <img 
                                            src={session.user.image} 
                                            alt="Profile" 
                                            className="rounded-circle mb-3"
                                            width="80" 
                                            height="80"
                                        />
                                    ) : (
                                        <div 
                                            className="rounded-circle bg-success d-flex align-items-center justify-content-center mb-3 mx-auto text-white"
                                            style={{
                                                width: '80px', 
                                                height: '80px', 
                                                fontSize: '32px',
                                                background: 'linear-gradient(135deg, #558B2F 0%, #33691E 100%)'
                                            }}
                                        >
                                            {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <h4 className="mb-1">{session.user?.name || 'User'}</h4>
                                    <p className="text-muted">{session.user?.email || 'No email available'}</p>
                                    <div className="d-flex justify-content-center gap-3">
                                        <div className="text-center stats-item">
                                            <div className="h5 mb-0" style={{ color: '#4CAF50' }}>{contributions.filter(c => c.state === 'approved').length}</div>
                                            <small className="text-muted">Species Added</small>
                                        </div>
                                        <div className="text-center stats-item">
                                            <div className="h5 mb-0" style={{ color: '#FFA726' }}>{contributions.filter(c => c.state === 'pending').length}</div>
                                            <small className="text-muted">Pending Review</small>
                                        </div>
                                        <div className="text-center stats-item">
                                            <div className="h5 mb-0" style={{ color: '#558B2F' }}>{contributions.length}</div>
                                            <small className="text-muted">Total Submissions</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="card shadow-sm profile-card">
                                <div className="card-header">
                            <ul className="nav nav-tabs card-header-tabs" role="tablist">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <i className="bi bi-person me-2"></i>Profile
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'contributions' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('contributions')}
                                    >
                                        <i className="bi bi-list-check me-2"></i>My Species
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'new-contribution' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('new-contribution')}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>Add Species
                                    </button>
                                </li>
                            </ul>
                                </div>

                                <div className="card-body">
                            {activeTab === 'profile' && (
                                <div>
                                    <h5 className="mb-4">
                                        <i className="bi bi-heart-fill text-danger me-2"></i>
                                        Your Conservation Journey
                                    </h5>
                                    <p className="text-muted mb-4">
                                        Welcome to your profile! Here you can track your species contributions to our database, 
                                        submit new endangered species information, and help expand our conservation catalog.
                                    </p>
                                    
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="mb-3">
                                                <h6 className="fw-bold">Full Name</h6>
                                                <p className="text-muted">{session.user.name}</p>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="mb-3">
                                                <h6 className="fw-bold">Email Address</h6>
                                                <p className="text-muted">{session.user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex gap-2 mt-4">
                                        <a href="/catalog" className="btn btn-primary">
                                            <i className="bi bi-binoculars me-2"></i>Explore Species
                                        </a>
                                        <a href="/learn" className="btn btn-outline-secondary">
                                            <i className="bi bi-book me-2"></i>Learn More
                                        </a>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contributions' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="mb-0">
                                            <i className="bi bi-list-check text-primary me-2"></i>
                                            Your Species Contributions
                                        </h5>
                                        <span className="text-muted">{contributions.length} species submitted</span>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-success" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="text-muted mt-3">Loading your contributions...</p>
                                        </div>
                                    ) : contributions.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-plus-circle display-4 text-muted"></i>
                                            <p className="text-muted mt-3">No species added yet. Help expand our conservation database!</p>
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => setActiveTab('new-contribution')}
                                            >
                                                Add Your First Species
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {contributions.map(contribution => (
                                                <div key={contribution.id} className="col-12 mb-3">
                                                    <div className="card border-0 bg-light">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex align-items-center mb-2">
                                                                        <i className="bi bi-bookmark-fill text-success me-2"></i>
                                                                        <h6 className="mb-0 ms-2">{contribution.nombre_comun}</h6>
                                                                        <div className="ms-auto">
                                                                            {getStatusBadge(contribution.state)}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-muted fst-italic mb-2">{contribution.nombre_cientifico}</p>
                                                                    <p className="text-muted mb-3">{contribution.descripcion}</p>
                                                                    <div className="row">
                                                                        <div className="col-sm-4">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-shield-exclamation me-1"></i>
                                                                                {contribution.categoria_lista_roja}
                                                                            </small>
                                                                        </div>
                                                                        <div className="col-sm-4">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-geo-alt me-1"></i>
                                                                                {contribution.top_lugares}
                                                                            </small>
                                                                        </div>
                                                                        <div className="col-sm-4">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-calendar me-1"></i>
                                                                                {contribution.createdAt ? new Date(contribution.createdAt).toLocaleDateString() : 'N/A'}
                                                                            </small>
                                                                        </div>
                                                                        <div className="col-sm-3">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-calendar me-1"></i>
                                                                                {contribution.date}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                    {contribution.foto_principal ? (
                                                                        <div className="mt-2 d-flex align-items-center">
                                                                            <img src={contribution.foto_principal} alt={contribution.nombre_comun} style={{ width: 120, height: 'auto', borderRadius: 8 }} />
                                                                            <div className="ms-3 text-muted small">{contribution.top_lugares}</div>
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}


                            {activeTab === 'new-contribution' && (
                                <div>
                                    <h5 className="mb-4">
                                        <i className="bi bi-plus-circle text-success me-2"></i>
                                        Add New Endangered Species
                                    </h5>
                                    <p className="text-muted mb-4">
                                        Help expand our endangered species database by submitting information about species you've discovered or researched.
                                    </p>

                                    <form onSubmit={handleSubmitContribution}>
                                        <div className="row">
                                            <div className="col-md-8 mb-3">
                                                <label className="form-label fw-bold">Species Common Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={contributionForm.nombre_comun}
                                                    onChange={(e) => setContributionForm({...contributionForm, nombre_comun: e.target.value})}
                                                    placeholder="e.g., Mexican Wolf"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label fw-bold">Conservation Status *</label>
                                                <select
                                                    className="form-select"
                                                    value={contributionForm.categoria_lista_roja}
                                                    onChange={(e) => setContributionForm({...contributionForm, categoria_lista_roja: e.target.value})}
                                                    required
                                                >
                                                    <option value="Critically Endangered">Critically Endangered</option>
                                                    <option value="Endangered">Endangered</option>
                                                    <option value="Vulnerable">Vulnerable</option>
                                                    <option value="Near Threatened">Near Threatened</option>
                                                    <option value="Least Concern">Least Concern</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Scientific Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                    value={contributionForm.nombre_cientifico}
                                                    onChange={(e) => setContributionForm({...contributionForm, nombre_cientifico: e.target.value})}
                                                    placeholder="e.g., Canis lupus baileyi"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Species Description *</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                    value={contributionForm.descripcion}
                                                    onChange={(e) => setContributionForm({...contributionForm, descripcion: e.target.value})}
                                                    placeholder="Describe the species, its characteristics, and importance..."
                                                required
                                            />
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Location/Habitat Range *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={contributionForm.top_lugares}
                                                    onChange={(e) => setContributionForm({...contributionForm, top_lugares: e.target.value})}
                                                    placeholder="e.g., Sierra Madre Occidental, Mexico"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Taxon SIS ID (optional)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={contributionForm.id_taxon_sis}
                                                    onChange={(e) => setContributionForm({...contributionForm, id_taxon_sis: e.target.value})}
                                                    placeholder="e.g., 12345"
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Main Photo URL (Optional)</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    value={contributionForm.foto_principal}
                                                    onChange={(e) => setContributionForm({...contributionForm, foto_principal: e.target.value})}
                                                    placeholder="https://example.com/species-image.jpg"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">iNaturalist / GBIF IDs (optional)</label>
                                                <div className="d-flex gap-2">
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={contributionForm.inat_id}
                                                        onChange={(e) => setContributionForm({...contributionForm, inat_id: e.target.value})}
                                                        placeholder="iNaturalist ID"
                                                    />
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={contributionForm.gbif_id}
                                                        onChange={(e) => setContributionForm({...contributionForm, gbif_id: e.target.value})}
                                                        placeholder="GBIF ID"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="alert alert-info">
                                            <i className="bi bi-info-circle me-2"></i>
                                            <strong>Review Process:</strong> All species submissions are reviewed by our conservation experts for accuracy. 
                                            You'll be notified within 5-7 business days about the status of your submission.
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button type="submit" className="btn btn-success">
                                                <i className="bi bi-check-circle me-2"></i>Submit Species
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => setActiveTab('contributions')}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
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