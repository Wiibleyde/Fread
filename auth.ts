import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
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
    pages: {
        newUser: "/create-account",
    },
    callbacks: {
        async signIn({ account, profile, user }) {
            // Determine provider ID field
            let providerIdField = null;
            let providerIdValue = null;
            if (account?.provider === "google") {
                providerIdField = "googleId";
                providerIdValue = account?.providerAccountId;
            } else if (account?.provider === "discord") {
                providerIdField = "discordId";
                providerIdValue = account?.providerAccountId;
            } else if (account?.provider === "apple") {
                providerIdField = "appleId";
                providerIdValue = account?.providerAccountId;
            }

            if (!providerIdField || !providerIdValue) return false;

            // Check if user exists
            let whereClause: import("@/app/generated/prisma/client").Prisma.AccountWhereUniqueInput;
            if (providerIdField === "googleId") {
                whereClause = { googleId: providerIdValue };
            } else if (providerIdField === "discordId") {
                whereClause = { discordId: providerIdValue };
            } else if (providerIdField === "appleId") {
                whereClause = { appleId: providerIdValue };
            } else {
                return false;
            }
            const dbUser = await prisma.account.findUnique({
                where: whereClause,
            });

            if (!dbUser) {
                // Create user in DB
                const newUser = await prisma.account.create({
                    data: {
                        [providerIdField]: providerIdValue,
                        username:
                            typeof profile?.name === "string" && profile.name
                                ? profile.name
                                : typeof profile?.displayName === "string" &&
                                    profile.displayName
                                  ? profile.displayName
                                  : typeof profile?.username === "string" &&
                                      profile.username
                                    ? profile.username
                                    : "New User",
                        displayName:
                            typeof profile?.name === "string" && profile.name
                                ? profile.name
                                : typeof profile?.displayName === "string" &&
                                    profile.displayName
                                  ? profile.displayName
                                  : typeof profile?.username === "string" &&
                                      profile.username
                                    ? profile.username
                                    : "New User",
                        description: "",
                    },
                });
                // Store the new user ID in the user object for JWT callback
                user.id = newUser.id;
            }
            // Always allow sign in - NextAuth will redirect new users to /create-account via pages.newUser
            return true;
        },
        async jwt({ token, account, user }) {
            // On initial sign-in, set up the token
            if (account) {
                token.accessToken = account.access_token as string;
                token.provider = account.provider as string;

                // Get provider ID
                let providerIdField = null;
                let providerIdValue = null;
                if (account?.provider === "google") {
                    providerIdField = "googleId";
                    providerIdValue = account?.providerAccountId;
                } else if (account?.provider === "discord") {
                    providerIdField = "discordId";
                    providerIdValue = account?.providerAccountId;
                } else if (account?.provider === "apple") {
                    providerIdField = "appleId";
                    providerIdValue = account?.providerAccountId;
                }

                // If user.id is set (from signIn callback for new users), use it
                if (user?.id) {
                    token.sub = user.id;
                }
                // Otherwise, fetch from database
                else if (providerIdField && providerIdValue) {
                    let whereClause: import("@/app/generated/prisma/client").Prisma.AccountWhereUniqueInput;
                    if (providerIdField === "googleId") {
                        whereClause = { googleId: providerIdValue };
                    } else if (providerIdField === "discordId") {
                        whereClause = { discordId: providerIdValue };
                    } else if (providerIdField === "appleId") {
                        whereClause = { appleId: providerIdValue };
                    } else {
                        return token;
                    }

                    const dbUser = await prisma.account.findUnique({
                        where: whereClause,
                        select: { id: true },
                    });

                    if (dbUser) {
                        token.sub = dbUser.id;
                    }
                }
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
