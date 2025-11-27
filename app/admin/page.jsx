import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'
import AdminPanelClient from './AdminPanelClient'

export default async function AdminPanel() {
    const session = await getServerSession(authOptions)
    
    if (!session) {
        redirect('/api/auth/signin')
    }
    
    //check if user is admin using environment variable
    const adminEmail = process.env.EMAIL_ADMIN
    if (!adminEmail || session.user.email !== adminEmail) {
        redirect('/')
    }

    return <AdminPanelClient session={session} />
}