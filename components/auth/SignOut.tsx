import { signOut } from "@/auth";
import { Button } from "../ui/button";

export function SignOut() {
    return (
        <form
            action={async () => {
                "use server";
                await signOut({
                    redirectTo: "/",
                });
            }}
            className="mt-4"
        >
            <Button
                type="submit"
                variant="outline"
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
            >
                Logout
            </Button>
        </form>
    );
}
