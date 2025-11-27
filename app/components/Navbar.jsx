'use client'
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { apiCall } from '../../lib/apiUtils';

export default function Navbar() {
    const { data: session, status } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    useEffect(() => {
        const checkAdminStatus = async () => {
            if (session?.user?.email) {
                try {
                    // Use direct fetch to hit Next.js API route instead of Express
                    const response = await fetch('/api/admin/check');
                    if (response.ok) {
                        const data = await response.json();
                        setIsAdmin(data.isAdmin);
                    }
                } catch (error) {
                    console.error('Error checking admin status:', error);
                }
            } else {
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, [session?.user?.email]);

    useEffect(() => {
        setImageError(false);
    }, [session?.user?.image]);
    
    console.log('Navbar session:', { status, session });
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
                                        className="nav-link dropdown-toggle text-white d-flex align-items-center"
                                        href="#"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {session.user?.image && !imageError ? (
                                            <img
                                                src={session.user.image}
                                                alt="Profile"
                                                className="rounded-circle me-2"
                                                width="32"
                                                height="32"
                                                onError={(e) => {
                                                    console.log('Profile image failed to load:', session.user?.image);
                                                    setImageError(true);
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle bg-success d-flex align-items-center justify-content-center me-2 text-white"
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        {session.user?.name || 'User'}
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" href="/profile">
                                                <i className="bi bi-person me-2"></i>Profile
                                            </Link>
                                        </li>
                                        {isAdmin && (
                                            <li>
                                                <Link className="dropdown-item" href="/admin">
                                                    <i className="bi bi-shield-check me-2"></i>Admin Panel
                                                </Link>
                                            </li>
                                        )}
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