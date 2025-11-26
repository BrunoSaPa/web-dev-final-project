import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
                token.picture = user.image
            }
            return token
        },
        async session({ session, token }) {
            session.user.id = token.id
            session.user.name = token.name
            session.user.email = token.email
            session.user.image = token.picture
            return session
        },
    },
})

export { handler as GET, handler as POST }