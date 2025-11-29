"use client";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

export function DeleteAccount() {

    const deleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/account", { method: "DELETE" });
            if (!response.ok) {
                console.error("Failed to delete account", await response.text());
                return;
            }
            await signOut({ callbackUrl: "/" });
        } catch (err) {
            console.error("Delete account error", err);
        }
    };

    return (
        <form onSubmit={deleteAccount} className="mt-4">
            <Button
                type="submit"
                variant="outline"
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
            >
                Delete Account
            </Button>
        </form>
    );
}
