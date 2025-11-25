import Link from 'next/link';

export default function Navbar() {
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
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}
