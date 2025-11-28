import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
    const session = await auth();

    return (
        <div>
            <form
                action={async () => {
                    "use server";
                    await signIn("discord", {
                        redirectTo: "/admin",
                    });
                }}
            >
                <button type="submit" className="w-full group relative">
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 rounded blur-sm group-hover:blur-md transition-all" />

                    <div className="relative bg-zinc-900 border-2 border-green-500/50 rounded px-6 py-4 hover:border-green-400 hover:bg-zinc-800 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="text-green-400 text-lg sm:text-xl">
                                    &gt;
                                </span>
                                <span className="font-mono text-green-400 text-sm sm:text-base font-medium">
                                    AUTHENTICATE_WITH_DISCORD()
                                </span>
                            </div>
                        </div>
                    </div>
                </button>
            </form>
            {/* Login google */}
            <form
                action={async () => {
                    "use server";
                    await signIn("google");
                }}
            >
                <button type="submit" className="w-full group relative mt-4">
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 via-sky-500/20 to-blue-500/20 rounded blur-sm group-hover:blur-md transition-all" />

                    <div className="relative bg-zinc-900 border-2 border-blue-500/50 rounded px-6 py-4 hover:border-blue-400 hover:bg-zinc-800 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,123,255,0.3)]">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="text-blue-400 text-lg sm:text-xl">
                                    &gt;
                                </span>
                                <span className="font-mono text-blue-400 text-sm sm:text-base font-medium">
                                    AUTHENTICATE_WITH_GOOGLE()
                                </span>
                            </div>
                        </div>
                    </div>
                </button>
            </form>
            {/* Logout */}
            <form
                action={async () => {
                    "use server";
                    await signOut({
                        redirectTo: "/",
                    });
                }}
                className="mt-4"
            >
                <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                >
                    Logout
                </button>
            </form>
            <div>
                {session ? (
                    <pre>{JSON.stringify(session, null, 2)}</pre>
                ) : (
                    <p>No session</p>
                )}
            </div>
        </div>
    );
}
