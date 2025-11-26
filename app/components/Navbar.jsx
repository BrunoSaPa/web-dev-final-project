'use client'
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar() {
    const { data: session, status } = useSession();
    return (
        <div className="navbar-container">
            <nav className="navbar navbar-expand-lg navbar-light w-100">
                <div className="container-fluid">
                    <Link href="/" className="navbar-brand">
                        <img src="/images/logo.png" alt="Logo" height="40" />
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link href="/" className="nav-link text-white">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/catalog" className="nav-link text-white">Explore</Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/contact" className="nav-link text-white">Contact Us</Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/learn" className="nav-link text-white">Learn More</Link>
                            </li>
                            
                            {status === 'loading' ? (
                                <li className="nav-item">
                                    <div className="nav-link">
                                        <div className="spinner-border spinner-border-sm text-white" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                </li>
                            ) : session ? (
                                <li className="nav-item dropdown">
                                    <a 
                                        className="nav-link dropdown-toggle d-flex align-items-center text-white" 
                                        href="#" 
                                        role="button" 
                                        data-bs-toggle="dropdown"
                                    >
                                        <img 
                                            src={session.user.image} 
                                            alt="Profile" 
                                            className="rounded-circle me-2"
                                            width="30" 
                                            height="30"
                                        />
                                        {session.user.name}
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" href="/profile">
                                                <i className="bi bi-person me-2"></i>Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" href="/favorites">
                                                <i className="bi bi-heart me-2"></i>Favorites
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button 
                                                className="dropdown-item" 
                                                onClick={() => signOut()}
                                            >
                                                <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            ) : (
                                <li className="nav-item">
                                    <button 
                                        className="btn btn-outline-light ms-2" 
                                        onClick={() => signIn('google')}
                                    >
                                        <i className="bi bi-google me-2"></i>Sign In
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}
