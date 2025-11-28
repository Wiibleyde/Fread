"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateAccountForm({
    defaultName,
    image,
}: {
    defaultName?: string;
    image?: string;
}) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        try {
            const res = await fetch("/api/create-account", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to create account");
                setLoading(false);
                return;
            }
            router.replace("/");
        } catch (_err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">
                        Complete Your Profile
                    </h1>
                    <p className="text-gray-500">
                        Set up your account to get started
                    </p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className="text-sm font-medium"
                        >
                            Username
                        </label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            defaultValue={defaultName || ""}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="file" className="text-sm font-medium">
                            Profile Picture (Optional)
                        </label>
                        <input
                            id="file"
                            name="file"
                            type="file"
                            accept="image/*"
                            className="w-full"
                        />
                    </div>
                    {image && (
                        <div className="flex justify-center">
                            <Image
                                src={image}
                                alt="Current Profile Picture"
                                width={100}
                                height={100}
                                className="rounded-full"
                            />
                        </div>
                    )}
                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating..." : "Create Account"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
