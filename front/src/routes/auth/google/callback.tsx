import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api-client";
import { storage } from "@/lib/storage";

export const Route = createFileRoute("/auth/google/callback")({
	component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
	const navigate = useNavigate();
	const { login } = useAuth();

	useEffect(() => {
		const handleCallback = async () => {
			const urlParams = new URLSearchParams(window.location.search);
			const code = urlParams.get("code");

			if (!code) {
				toast.error("No authorization code received");
				navigate({ to: "/login" });
				return;
			}

			try {
				const { token } = await authApi.handleGoogleCallback(code);
				login(token);

				const redirectUrl = storage.getRedirectUrl();
				storage.removeRedirectUrl();

				navigate({ to: redirectUrl || "/feed" });
			} catch (error) {
				console.error("Google login failed:", error);
				toast.error("Failed to login with Google");
				navigate({ to: "/login" });
			}
		};

		handleCallback();
	}, [login, navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h2 className="text-2xl font-bold">Logging in with Google...</h2>
			</div>
		</div>
	);
}
