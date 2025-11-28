"use client";
import Image from "next/image";
import type { Session } from "next-auth";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CreateAccountProps {
    session: Session;
}

const CreateAccount = ({ session }: CreateAccountProps) => {
    const [username, setUsername] = useState<string>(session?.user?.name || "");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [fileUrl] = useState<string>(session?.user?.image || "");

    return (
        <div>
            <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <Input
                type="file"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        setProfilePicture(e.target.files[0]);
                        setFileName(e.target.files[0].name);
                    }
                }}
            />

            <Image
                src={
                    profilePicture
                        ? URL.createObjectURL(profilePicture)
                        : fileUrl
                }
                alt="Profile Picture"
                width={100}
                height={100}
            />

            <p>Selected file: {fileName}</p>

            <Button>Create Account</Button>
        </div>
    );
};

export default CreateAccount;
