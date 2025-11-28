import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import "./auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // Apple({
        //     clientId: process.env.AUTH_APPLE_ID,
        //     clientSecret: process.env.AUTH_APPLE_SECRET,
        // }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Discord({
            clientId: process.env.AUTH_DISCORD_ID,
            clientSecret: process.env.AUTH_DISCORD_SECRET,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token as string;
                token.provider = account.provider as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub;
                session.accessToken = token.accessToken as string;
                session.provider = token.provider as string;
            }
            return session;
        },
    },
});
