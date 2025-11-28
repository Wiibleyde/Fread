import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CreateAccountForm from "@/components/auth/CreateAccountForm";

export default async function CreateAccountPage() {
    const session = await auth();
    if (!session || !session.user?.id || !session.isNewUser) {
        redirect("/");
    }
    return (
        <CreateAccountForm
            defaultName={session.user.name ?? undefined}
            image={session.user.image ?? undefined}
        />
    );
}
