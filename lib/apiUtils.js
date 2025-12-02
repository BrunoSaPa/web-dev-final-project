// API utility functions for client-side API calls

// Base URL for Express backend API - uses environment variable or defaults to localhost:3001
export const API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001';

// Wrapper function for API calls that routes auth requests to Next.js and others to Express
export const apiCall = async (endpoint, options = {}) => {
    // Keep authentication routes on Next.js server, route others to Express
    const url = endpoint.startsWith('/api/auth') 
        ? endpoint // NextAuth routes stay on Next.js
        : `${API_BASE_URL}${endpoint}`; // Species API routes go to Express
    
    // Make fetch request with provided options
    return fetch(url, options);
};