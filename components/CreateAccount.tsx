"use client";
import Image from "next/image";
import type { Session } from "next-auth";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CreateAccountProps {
    session: Session;
}

function CreateAccount({ session }: CreateAccountProps) {
    const [username, setUsername] = useState<string>(session?.user?.name || "");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");

    const handleSubmit = async () => {
        const form = new FormData();
        form.append("username", username);
        form.append("session", JSON.stringify(session));
        if (profilePicture) {
            form.append(
                "file",
                profilePicture,
                fileName || profilePicture.name,
            );
        }
        const response = await fetch("/api/auth/create-account", {
            method: "POST",
            body: form,
        });

        console.log("Account created:", response.status);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setProfilePicture(f);
        setFileName(f.name);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
            }}
        >
            <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input type="file" accept="image/*" onChange={handleFile} />

            {/* <Input
                type="file"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        setProfilePicture(e.target.files[0]);
                        setFileName(e.target.files[0].name);
                    }
                }}
            /> */}

            <Image
                src={
                    profilePicture
                        ? URL.createObjectURL(profilePicture)
                        : (session?.user?.image as string)
                }
                alt="Profile Picture"
                width={100}
                height={100}
            />

            <p>Selected file: {fileName}</p>

            <Button
                type="submit"
                onClick={async () => {
                    await handleSubmit();
                }}
            >
                Create Account
            </Button>
        </form>
    );
}

export default CreateAccount;
