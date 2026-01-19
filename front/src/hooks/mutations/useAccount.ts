import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { storage } from "@/lib/storage";
import { toast } from "react-toastify";

export const useEditAccount = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			displayName,
			description,
			isPrivate,
		}: {
			displayName?: string;
			description?: string | null;
			isPrivate?: boolean;
		}) => {
			const token = storage.getToken();
			if (!token) throw new Error("Not authenticated");
			return accountApi.editAccount({
				token,
				displayName,
				description,
				isPrivate,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.account.all });
			toast.success("Profile updated successfully");
		},
		onError: () => {
			toast.error("Failed to update profile");
		},
	});
};

export const useDeleteAccount = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (accountId: string) => {
			const token = storage.getToken();
			if (!token) throw new Error("Not authenticated");
			return accountApi.deleteAccount(accountId, { token });
		},
		onSuccess: () => {
			storage.clear();
			queryClient.clear();
			toast.success("Account deleted successfully");
			window.location.href = "/login";
		},
		onError: () => {
			toast.error("Failed to delete account");
		},
	});
};
