"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function NewUserRedirect() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        console.log("[NewUserRedirect] Status:", status);
        console.log("[NewUserRedirect] Session:", session);
        console.log("[NewUserRedirect] isNewUser:", session?.isNewUser);
        console.log("[NewUserRedirect] pathname:", pathname);

        if (
            status === "authenticated" &&
            session?.isNewUser &&
            pathname !== "/create-account"
        ) {
            console.log("[NewUserRedirect] Redirecting to /create-account");
            router.push("/create-account");
        }
    }, [session, status, pathname, router]);

    return null;
}
