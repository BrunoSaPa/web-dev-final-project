import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// NextAuth configuration with Google OAuth provider
export const authOptions = {
    // Define authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    // Callbacks for customizing token and session behavior
    callbacks: {
        // Called when JWT token is created or updated
        async jwt({ token, user, account, profile }) {
            // Store user information in token on first login
            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
                token.picture = user.image
            }
            return token
        },
        // Called when session is accessed
        async session({ session, token }) {
            // Add custom user data to session from token
            session.user.id = token.id
            session.user.name = token.name
            session.user.email = token.email
            session.user.image = token.picture
            return session
        },
    },
}

// Create NextAuth handler
const handler = NextAuth(authOptions)

// Export handler for GET and POST requests
export { handler as GET, handler as POST }