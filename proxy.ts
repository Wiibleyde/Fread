import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function proxy(req: NextRequest) {
    const session = await auth();
    const { pathname } = req.nextUrl;

    const isLoggedIn = !!session;
    const isNewUser = session?.isNewUser;

    const isOnCreateAccount = pathname === "/create-account";
    const isOnAuth = pathname.startsWith("/api/auth");

    console.log("[PROXY]", {
        pathname,
        isLoggedIn,
        isNewUser,
        userId: session?.user?.id,
    });

    // Don't redirect auth routes
    if (isOnAuth) {
        return NextResponse.next();
    }

    // If user is logged in and is a new user, redirect to create-account
    if (isLoggedIn && isNewUser && !isOnCreateAccount) {
        console.log("[PROXY] Redirecting to /create-account");
        return NextResponse.redirect(new URL("/create-account", req.nextUrl));
    }

    // If user is on create-account but is not a new user, redirect to home
    if (isLoggedIn && !isNewUser && isOnCreateAccount) {
        console.log("[PROXY] Redirecting to /");
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
