import { auth } from "@/auth";
import { SignIn } from "@/components/auth/SignIn";
import { SignOut } from "@/components/auth/SignOut";

export default async function Home() {
    const session = await auth();

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
        </div>
    );
}
