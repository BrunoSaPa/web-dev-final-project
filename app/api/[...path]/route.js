import { NextRequest, NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const path = params.path ? params.path.join('/') : '';
    
    // Don't proxy auth routes - they're handled by Next.js
    if (path.startsWith('auth/')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Construct the URL to the Express server
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? `http://localhost:${process.env.EXPRESS_PORT || 3001}`
        : 'http://localhost:3001';
    
    const url = `${baseUrl}/${path}${queryString ? '?' + queryString : ''}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': request.headers.get('content-type') || 'application/json',
            }
        });
        
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    const path = params.path ? params.path.join('/') : '';
    
    // Don't proxy auth routes - they're handled by Next.js
    if (path.startsWith('auth/')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Construct the URL to the Express server
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? `http://localhost:${process.env.EXPRESS_PORT || 3001}`
        : 'http://localhost:3001';
    
    const url = `${baseUrl}/${path}`;
    
    try {
        const body = await request.json().catch(() => ({}));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
