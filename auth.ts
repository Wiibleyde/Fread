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
    callbacks: {
        async signIn({ account, profile, user }) {
            console.log("[SIGNIN] Starting signIn callback", {
                provider: account?.provider,
                providerAccountId: account?.providerAccountId,
            });

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

            if (!providerIdField || !providerIdValue) {
                console.log("[SIGNIN] ERROR: No provider field or value");
                return false;
            }

            // Check if user exists
            let whereClause: import("@/app/generated/prisma/client").Prisma.AccountWhereUniqueInput;
            if (providerIdField === "googleId") {
                whereClause = { googleId: providerIdValue };
            } else if (providerIdField === "discordId") {
                whereClause = { discordId: providerIdValue };
            } else if (providerIdField === "appleId") {
                whereClause = { appleId: providerIdValue };
            } else {
                console.log("[SIGNIN] ERROR: Invalid provider field");
                return false;
            }

            console.log("[SIGNIN] Checking if user exists:", whereClause);

            const dbUser = await prisma.account.findUnique({
                where: whereClause,
                select: {
                    id: true,
                    profileCompleted: true,
                },
            });

            console.log("[SIGNIN] User found:", dbUser);

            if (!dbUser) {
                // Create NEW user in DB with profileCompleted: false
                console.log("[SIGNIN] Creating new user");
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
                        profileCompleted: false,
                    },
                });
                console.log("[SIGNIN] New user created:", newUser.id);
                user.id = newUser.id;
                user.needsOnboarding = true;
                // Return true to allow sign in, redirect will be handled by proxy
                return true;
            }

            // Existing user
            console.log(
                "[SIGNIN] Existing user, profileCompleted:",
                dbUser.profileCompleted,
            );
            user.id = dbUser.id;
            user.needsOnboarding = !dbUser.profileCompleted;

            // Always return true, let proxy handle redirect
            return true;
        },
        async jwt({ token, account, user }) {
            // On initial sign-in, set up the token
            if (account) {
                token.accessToken = account.access_token as string;
                token.provider = account.provider as string;

                // Set user ID from signIn callback
                if (user?.id) {
                    token.sub = user.id;
                    token.needsOnboarding = user.needsOnboarding || false;
                }
            }

            // Check profile completion status and admin on every token refresh
            if (token.sub) {
                const dbUser = await prisma.account.findUnique({
                    where: { id: token.sub as string },
                    select: {
                        profileCompleted: true,
                        admin: true,
                    },
                });

                if (dbUser) {
                    token.needsOnboarding = !dbUser.profileCompleted;
                    token.admin = dbUser.admin;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub;
                session.accessToken = token.accessToken as string;
                session.provider = token.provider as string;
                session.isNewUser = token.needsOnboarding as boolean;
                session.admin = token.admin as boolean;
            }

            return session;
        },
    },
});
