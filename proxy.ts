import { NextResponse } from "next/server";

export function proxy() {
    // Let the app handle auth redirects since middleware runs in Edge Runtime
    // and cannot access Prisma/Node.js APIs
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
