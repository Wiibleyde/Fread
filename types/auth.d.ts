import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
        accessToken?: string;
        provider?: string;
        isNewUser?: boolean;
    }

    interface JWT {
        accessToken?: string;
        provider?: string;
        isNewUser?: boolean;
    }

    interface User {
        isNewUser?: boolean;
    }
}
