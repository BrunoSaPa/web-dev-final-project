import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ isAdmin: false });
        }

        const adminEmail = process.env.EMAIL_ADMIN;
        const isAdmin = adminEmail && session.user.email === adminEmail;

        return NextResponse.json({ isAdmin });
    } catch (error) {
        console.error('Error checking admin status:', error);
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}
