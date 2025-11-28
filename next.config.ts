import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    images: {
        remotePatterns: [
            new URL("https://cdn.discordapp.com/avatars/**"),
            new URL("https://lh3.googleusercontent.com/a/**"),
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb", // Allow up to 10MB for image uploads (we limit to 5MB client-side)
        },
    },
};

export default nextConfig;
