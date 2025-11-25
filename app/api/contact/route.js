import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, comment } = body;
        console.log('Contact form submission:', { name, email, comment });
        return NextResponse.json({ success: true, name });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
    }
}
