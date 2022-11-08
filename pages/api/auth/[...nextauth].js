import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import firebase from "../../../lib/firebase";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async jwt({ token, user }) {

            // if anything other than token is defined, this is the first time login.
            if(user) {
                const existingUser = await firebase.db.collection('users').doc(user.id).get();
                const existingUserData = existingUser.data();

                if(!existingUserData) {
                    await firebase.db.collection('users').doc(user.id).set({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    });
                }

                token.id = user.id;
            }

            return token
        },
        async session({ session, token }) {
            session.user.id = token.id;
            return session;
        }
    }
}
export default NextAuth(authOptions)