import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CreateAccount from "@/components/CreateAccount";

export default async function CreateAccountPage() {
    const session = await auth();

    // If no session or not a new user, redirect to home
    if (!session || !session.isNewUser) {
        redirect("/");
    }

    return (
        <div>
            <CreateAccount session={session} />
        </div>
    );
}
