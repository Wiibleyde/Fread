import { auth } from "@/auth";
import { SignIn } from "@/components/auth/SignIn";
import { SignOut } from "@/components/auth/SignOut";
import { prisma } from "@/lib/prisma";

export default async function Home() {
    const session = await auth();

    const user = session?.user?.id
        ? await prisma.account.findUnique({
              where: { id: session.user.id },
          })
        : null;

    return (
        <div>
            <SignIn provider="discord" />
            <SignIn provider="google" />

            <SignOut />
            <div>
                {session ? (
                    <pre>{JSON.stringify(session, null, 2)}</pre>
                ) : (
                    <p>No active session</p>
                )}
            </div>
            <div>
                {user ? (
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                ) : (
                    <p>No user data</p>
                )}
            </div>
        </div>
    );
}
