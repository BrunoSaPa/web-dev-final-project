"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);
    const [nameSuccess, setNameSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setSubmitted(true);
                setNameSuccess(data.name);
                e.target.reset();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8 px-3">
                    <div className="card shadow-sm contact-card" style={{ borderRadius: '12px' }}>
                        <div className="card-body">
                            <h2 className="card-title mb-3">Contact Us</h2>
                            <p className="card-text mb-4">Have questions or want to help? Send us a message and we'll get back to you.</p>

                            {submitted && (
                                <div className="alert alert-success" role="alert">
                                    Thanks <strong>{nameSuccess}</strong> — your message has been sent (not really, we're just logging it :)).
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label" style={{ fontWeight: 600 }}>Name</label>
                                    <input type="text" className="form-control" id="name" name="name" placeholder="Your name" required />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label" style={{ fontWeight: 600 }}>Email</label>
                                    <input type="email" className="form-control" id="email" name="email" placeholder="you@example.com" required />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="comment" className="form-label" style={{ fontWeight: 600 }}>Comment</label>
                                    <textarea className="form-control" id="comment" name="comment" rows="5" placeholder="Write your message here..." required></textarea>
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" id="contact">Send message</button>
                                    <Link href="/" className="btn btn-outline-secondary">Cancel</Link>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
