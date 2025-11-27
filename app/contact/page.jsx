"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);
    const [nameSuccess, setNameSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSubmitted(true);
                setNameSuccess(data.name);
                form.reset();
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                setError('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style jsx>{`
                .contact-page {
                    background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 50%, #C8E6C9 100%);
                    min-height: 100vh;
                    padding: 4rem 0;
                }

                .contact-header {
                    text-align: center;
                    margin-bottom: 4rem;
                    animation: fadeInUp 0.6s ease;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .contact-header h1 {
                    color: #1B5E20;
                    font-weight: 900;
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    text-shadow: 2px 2px 4px rgba(85, 139, 47, 0.1);
                }

                .contact-header p {
                    color: #558B2F;
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                .contact-card {
                    background: linear-gradient(135deg, white 0%, #FAFAFA 100%);
                    border: 2px solid #E8F5E9;
                    border-radius: 25px;
                    padding: 3rem;
                    box-shadow: 0 10px 40px rgba(85, 139, 47, 0.15);
                    animation: fadeInScale 0.8s ease;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .contact-card:hover {
                    box-shadow: 0 15px 50px rgba(85, 139, 47, 0.25);
                    border-color: #558B2F;
                }

                .form-label {
                    color: #1B5E20 !important;
                    font-weight: 700;
                    font-size: 0.95rem;
                    margin-bottom: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .form-control {
                    border: 2px solid #E8F5E9 !important;
                    border-radius: 12px !important;
                    padding: 0.75rem 1rem !important;
                    transition: all 0.3s ease !important;
                    font-size: 0.95rem;
                }

                .form-control:focus {
                    border-color: #558B2F !important;
                    box-shadow: 0 0 0 0.25rem rgba(85, 139, 47, 0.15) !important;
                    transform: translateY(-2px);
                }

                .btn-submit {
                    background: linear-gradient(135deg, #558B2F 0%, #33691E 100%);
                    border: none;
                    color: white !important;
                    font-weight: 700;
                    transition: all 0.3s ease;
                    padding: 0.85rem 2.5rem;
                    border-radius: 12px;
                    font-size: 1rem;
                    box-shadow: 0 4px 15px rgba(85, 139, 47, 0.3);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-submit:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(85, 139, 47, 0.4);
                    background: linear-gradient(135deg, #33691E 0%, #1B5E20 100%);
                }
                
                .btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-cancel {
                    border: 2px solid #558B2F !important;
                    color: #558B2F !important;
                    font-weight: 700;
                    padding: 0.85rem 2rem;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    background: white;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-cancel:hover {
                    background: #558B2F;
                    color: white !important;
                    transform: translateY(-3px);
                    box-shadow: 0 4px 15px rgba(85, 139, 47, 0.3);
                }

                .alert-success {
                    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%) !important;
                    border: 2px solid #558B2F !important;
                    color: #1B5E20 !important;
                    border-radius: 12px;
                    padding: 1.25rem;
                    font-weight: 600;
                    animation: slideInDown 0.5s ease;
                }
                
                .alert-danger {
                    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%) !important;
                    border: 2px solid #d32f2f !important;
                    color: #b71c1c !important;
                    border-radius: 12px;
                    padding: 1.25rem;
                    font-weight: 600;
                    animation: slideInDown 0.5s ease;
                }
                
                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .spinner-border {
                    width: 1.2rem;
                    height: 1.2rem;
                    border-width: 2px;
                }
            `}</style>

            <div className="contact-page">
                <div className="container">
                    <div className="contact-header">
                        <h1><i className="bi bi-envelope-open me-3"></i>Contact Us</h1>
                        <p>Have questions or want to help? Send us a message and we'll get back to you.</p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-12 col-md-10 col-lg-8">
                            <div className="contact-card">
                                {submitted && (
                                    <div className="alert alert-success mb-4" role="alert">
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        Thanks <strong>{nameSuccess}</strong> — your message has been sent successfully!
                                    </div>
                                )}

                                {error && (
                                    <div className="alert alert-danger mb-4" role="alert">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="name" className="form-label">
                                            <i className="bi bi-person-fill"></i>
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            name="name"
                                            placeholder="Your full name"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="email" className="form-label">
                                            <i className="bi bi-envelope-fill"></i>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            placeholder="you@example.com"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="comment" className="form-label">
                                            <i className="bi bi-chat-left-text-fill"></i>
                                            Message
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="comment"
                                            name="comment"
                                            rows="6"
                                            placeholder="Write your message here..."
                                            required
                                            disabled={loading}
                                        ></textarea>
                                    </div>

                                    <div className="d-flex gap-3 flex-wrap">
                                        <button type="submit" className="btn btn-submit" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border" role="status" aria-hidden="true"></span>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-send-fill"></i>
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                        <Link href="/" className="btn btn-cancel">
                                            <i className="bi bi-arrow-left"></i>
                                            Back to Home
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
