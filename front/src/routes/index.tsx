import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate({ to: "/feed" });
		}
	}, [isAuthenticated, navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="mb-4 text-6xl font-bold">Fread</h1>
				<p className="mb-8 text-xl text-gray-600">
					A minimalist social network
				</p>
				<Button
					onClick={() => navigate({ to: "/login" })}
					className="bg-black text-white hover:bg-gray-800"
				>
					Get Started
				</Button>
			</div>
		</div>
	);
}
