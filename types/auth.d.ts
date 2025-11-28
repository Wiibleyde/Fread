import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
        accessToken?: string;
        provider?: string;
        isNewUser?: boolean;
        admin?: boolean;
    }

    interface JWT {
        accessToken?: string;
        provider?: string;
        needsOnboarding?: boolean;
        admin?: boolean;
    }

    interface User {
        needsOnboarding?: boolean;
    }
}
