'use client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState } from 'react'

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
        speciesName: '',
        scientificName: '',
        description: '',
        location: '',
        conservationStatus: 'Vulnerable',
        habitat: '',
        threats: '',
        imageUrl: ''
    })

    //REMEMBER THIS IS NOT PERMAMENT, JUST FOR DEMO PURPOSES
    const contributions = [
        {
            id: 1,
            speciesName: "Vaquita Marina",
            scientificName: "Phocoena sinus",
            description: "The world's most endangered marine mammal, found only in the Gulf of California",
            status: "accepted",
            date: "2024-11-15",
            location: "Gulf of California",
            conservationStatus: "Critically Endangered",
            habitat: "Shallow coastal waters",
            threats: "Fishing nets, habitat loss"
        },
        {
            id: 2,
            speciesName: "Mexican Wolf",
            scientificName: "Canis lupus baileyi",
            description: "Also known as lobo, this is the most genetically distinct lineage of wolves in North America",
            status: "waiting",
            date: "2024-11-20",
            location: "Sierra Madre Occidental",
            conservationStatus: "Endangered",
            habitat: "Mountain forests and grasslands",
            threats: "Habitat fragmentation, human conflict"
        },
        {
            id: 3,
            speciesName: "Axolotl",
            scientificName: "Ambystoma mexicanum",
            description: "Endemic salamander known for its regenerative abilities, found only in Xochimilco",
            status: "rejected",
            date: "2024-11-10",
            location: "Xochimilco, Mexico City",
            conservationStatus: "Critically Endangered",
            habitat: "Freshwater canals and lakes",
            threats: "Water pollution, urbanization"
        }
    ]

    const handleSubmitContribution = (e) => {
        e.preventDefault()
        //FINAL DATA SCHEMA WILL BE DESIGNED LATER, THIS IS JUST A SPACEHOLDER FOR NOW :)
        console.log('New species contribution:', contributionForm)
        alert('Species contribution submitted! It will be reviewed by our conservation team.')
        setContributionForm({
            speciesName: '',
            scientificName: '',
            description: '',
            location: '',
            conservationStatus: 'Vulnerable',
            habitat: '',
            threats: '',
            imageUrl: ''
        })
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return <span className="badge bg-success">Accepted</span>
            case 'rejected':
                return <span className="badge bg-danger">Rejected</span>
            case 'waiting':
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
        <div className="container my-5">
            <div className="row">
                {/* Profile Header */}
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-body text-center">
                            {session.user?.image ? (
                                <img 
                                    src={session.user.image} 
                                    alt="Profile" 
                                    className="rounded-circle mb-3"
                                    width="80" 
                                    height="80"
                                    onError={(e) => {
                                        console.log('Profile image failed to load:', session.user.image);
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-3 mx-auto text-white"
                                style={{
                                    width: '80px', 
                                    height: '80px', 
                                    fontSize: '32px',
                                    display: session.user?.image ? 'none' : 'flex'
                                }}
                            >
                                {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <h4 className="mb-1">{session.user?.name || 'User'}</h4>
                            <p className="text-muted">{session.user?.email || 'No email available'}</p>
                            <div className="d-flex justify-content-center gap-3">
                                <div className="text-center">
                                    <div className="h5 mb-0 text-success">{contributions.filter(c => c.status === 'accepted').length}</div>
                                    <small className="text-muted">Species Added</small>
                                </div>
                                <div className="text-center">
                                    <div className="h5 mb-0 text-warning">{contributions.filter(c => c.status === 'waiting').length}</div>
                                    <small className="text-muted">Pending Review</small>
                                </div>
                                <div className="text-center">
                                    <div className="h5 mb-0 text-primary">{contributions.length}</div>
                                    <small className="text-muted">Total Submissions</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="card shadow">
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

                                    {contributions.length === 0 ? (
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
                                                                        <h6 className="mb-0 ms-2">{contribution.speciesName}</h6>
                                                                        <div className="ms-auto">
                                                                            {getStatusBadge(contribution.status)}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-muted fst-italic mb-2">{contribution.scientificName}</p>
                                                                    <p className="text-muted mb-3">{contribution.description}</p>
                                                                    <div className="row">
                                                                        <div className="col-sm-3">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-shield-exclamation me-1"></i>
                                                                                {contribution.conservationStatus}
                                                                            </small>
                                                                        </div>
                                                                        <div className="col-sm-3">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-geo-alt me-1"></i>
                                                                                {contribution.location}
                                                                            </small>
                                                                        </div>
                                                                        <div className="col-sm-3">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-tree me-1"></i>
                                                                                {contribution.habitat}
                                                                            </small>
                                                                        </div>
                                                                        <div className="col-sm-3">
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-calendar me-1"></i>
                                                                                {contribution.date}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <small className="text-muted">
                                                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                                                            <strong>Threats:</strong> {contribution.threats}
                                                                        </small>
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
                                                    value={contributionForm.speciesName}
                                                    onChange={(e) => setContributionForm({...contributionForm, speciesName: e.target.value})}
                                                    placeholder="e.g., Mexican Wolf"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label fw-bold">Conservation Status *</label>
                                                <select
                                                    className="form-select"
                                                    value={contributionForm.conservationStatus}
                                                    onChange={(e) => setContributionForm({...contributionForm, conservationStatus: e.target.value})}
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
                                                value={contributionForm.scientificName}
                                                onChange={(e) => setContributionForm({...contributionForm, scientificName: e.target.value})}
                                                placeholder="e.g., Canis lupus baileyi"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Species Description *</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={contributionForm.description}
                                                onChange={(e) => setContributionForm({...contributionForm, description: e.target.value})}
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
                                                    value={contributionForm.location}
                                                    onChange={(e) => setContributionForm({...contributionForm, location: e.target.value})}
                                                    placeholder="e.g., Sierra Madre Occidental, Mexico"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Habitat Type *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={contributionForm.habitat}
                                                    onChange={(e) => setContributionForm({...contributionForm, habitat: e.target.value})}
                                                    placeholder="e.g., Mountain forests, grasslands"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Main Threats *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={contributionForm.threats}
                                                    onChange={(e) => setContributionForm({...contributionForm, threats: e.target.value})}
                                                    placeholder="e.g., Habitat loss, human conflict"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold">Image URL (Optional)</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    value={contributionForm.imageUrl}
                                                    onChange={(e) => setContributionForm({...contributionForm, imageUrl: e.target.value})}
                                                    placeholder="https://example.com/species-image.jpg"
                                                />
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
    )
}