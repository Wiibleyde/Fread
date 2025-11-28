import { FaApple, FaDiscord, FaGoogle } from "react-icons/fa";
import { signIn } from "@/auth";
import { Button } from "../ui/button";

interface SignInProps {
    provider: "google" | "discord" | "apple";
}

export function SignIn({ provider }: SignInProps) {
    let icon: React.ReactNode;

    switch (provider) {
        case "google":
            icon = <FaGoogle />;
            break;
        case "discord":
            icon = <FaDiscord />;
            break;
        case "apple":
            icon = <FaApple />;
            break;
        default:
            throw new Error("Unsupported provider");
    }

    return (
        <form
            action={async () => {
                "use server";
                await signIn(provider, { redirectTo: "/" });
            }}
        >
            <Button type="submit" variant="outline" size="lg">
                {icon}
                Sign in with{" "}
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </Button>
        </form>
    );
}
