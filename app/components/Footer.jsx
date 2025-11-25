export default function Footer() {
    return (
        <footer className="py-4" style={{ backgroundColor: 'var(--text-color)', color: 'var(--fourth-color)' }}>
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="d-flex align-items-center mb-3">
                            <img src="/images/logo.png" alt="Mexican Wildlife Logo" className="me-2" style={{ height: '32px' }} />
                            <span className="fw-bold">Mexican Wildlife</span>
                        </div>
                        <p className="mb-0">Protecting Mexico's endangered species for future generations.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
