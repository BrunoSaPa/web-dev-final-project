// API utility functions for client-side API calls
export const API_BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3001';

export const apiCall = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('/api/auth') 
        ? endpoint // Keep auth routes pointing to Next.js
        : `${API_BASE_URL}${endpoint}`;
    
    return fetch(url, options);
};