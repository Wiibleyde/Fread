import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { storage } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ location }) => {
		const token = storage.getToken();
		if (!token) {
			storage.setRedirectUrl(location.href);
			throw redirect({
				to: "/login",
			});
		}
		return { token };
	},
	component: () => <Outlet />,
});
