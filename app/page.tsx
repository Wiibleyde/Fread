import Image from "next/image";
import { auth } from "@/auth";
import { DeleteAccount } from "@/components/auth/DeleteAccount";
import { SignIn } from "@/components/auth/SignIn";
import { SignOut } from "@/components/auth/SignOut";

export default async function Home() {
    const session = await auth();

    return (
        <div>
            <SignIn provider="discord" />
            <SignIn provider="google" />

            <SignOut />
            <DeleteAccount />
            <div>
                {session ? (
                    <>
                        <pre>{JSON.stringify(session, null, 2)}</pre>
                        <Image
                            src={session?.user?.image as string}
                            alt="Profile Picture"
                            width={100}
                            height={100}
                        />
                    </>
                ) : (
                    <p>No active session</p>
                )}
            </div>
        </div>
    );
}
