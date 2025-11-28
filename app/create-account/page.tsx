import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveFileToDisk } from "@/lib/file";
import { prisma } from "@/lib/prisma";

async function createAccount(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const username = formData.get("username")?.toString().trim();
    const file = formData.get("file") as File | null;

    if (!username) {
        throw new Error("Username is required");
    }

    const updateData: {
        displayName: string;
        profileCompleted: boolean;
        profilePictureId?: string;
    } = {
        displayName: username,
        profileCompleted: true,
    };

    if (file && file.size > 0) {
        const fileName = await saveFileToDisk(file);
        const createdFile = await prisma.file.create({
            data: {
                fileName: fileName,
                accountId: session.user.id,
            },
        });
        updateData.profilePictureId = createdFile.id;
    }

    await prisma.account.update({
        where: { id: session.user.id },
        data: updateData,
    });

    redirect("/");
}

export default async function CreateAccountPage() {
    const session = await auth();

    if (!session || !session.isNewUser) {
        redirect("/");
    }

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

                <form action={createAccount} className="space-y-4">
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
                            defaultValue={session.user.name || ""}
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

                    {session.user.image && (
                        <div className="flex justify-center">
                            <Image
                                src={session.user.image}
                                alt="Current Profile Picture"
                                width={100}
                                height={100}
                                className="rounded-full"
                            />
                        </div>
                    )}

                    <Button type="submit" className="w-full">
                        Create Account
                    </Button>
                </form>
            </div>
        </div>
    );
}
