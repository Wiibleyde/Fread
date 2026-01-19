import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api-client";
import { storage } from "@/lib/storage";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			navigate({ to: "/feed" });
		}
	}, [isAuthenticated, navigate]);

	const handleDiscordLogin = async () => {
		try {
			storage.setRedirectUrl(window.location.pathname);
			const { url } = await authApi.getDiscordRedirect();
			window.location.href = url;
		} catch (error) {
			console.error("Failed to get Discord redirect URL:", error);
		}
	};

	const handleGoogleLogin = async () => {
		try {
			storage.setRedirectUrl(window.location.pathname);
			const { url } = await authApi.getGoogleRedirect();
			window.location.href = url;
		} catch (error) {
			console.error("Failed to get Google redirect URL:", error);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md space-y-8 border border-black p-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold">Fread</h1>
					<p className="mt-2 text-gray-600">Sign in to continue</p>
				</div>

				<div className="space-y-4">
					<Button
						onClick={handleDiscordLogin}
						className="w-full bg-black text-white hover:bg-gray-800"
					>
						Continue with Discord
					</Button>

					<Button
						onClick={handleGoogleLogin}
						className="w-full bg-black text-white hover:bg-gray-800"
					>
						Continue with Google
					</Button>
				</div>
			</div>
		</div>
	);
}
