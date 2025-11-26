'use client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function Profile() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/api/auth/signin')
        },
    })

    if (status === 'loading') {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-body text-center">
                            <img 
                                src={session.user.image} 
                                alt="Profile" 
                                className="rounded-circle mb-3"
                                width="100" 
                                height="100"
                            />
                            <h2 className="mb-1">{session.user.name}</h2>
                            <p className="text-muted mb-4">{session.user.email}</p>
                            
                            <div className="row text-start">
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
                            
                            <div className="mt-4">
                                <h5 className="mb-3">
                                    <i className="bi bi-heart-fill text-danger me-2"></i>
                                    Your Conservation Journey
                                </h5>
                                <p className="text-muted">
                                    Welcome to your profile! Here you can track your favorite endangered species, 
                                    view your conservation contributions, and stay updated on the latest wildlife protection efforts.
                                </p>
                                
                                <div className="d-flex gap-2 justify-content-center mt-4">
                                    <a href="/catalog" className="btn btn-primary">
                                        <i className="bi bi-binoculars me-2"></i>Explore Species
                                    </a>
                                    <a href="/learn" className="btn btn-outline-secondary">
                                        <i className="bi bi-book me-2"></i>Learn More
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}