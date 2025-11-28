import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    images: {
        remotePatterns: [
            new URL('https://cdn.discordapp.com/avatars/**'),
            new URL('https://lh3.googleusercontent.com/a/**'),
        ],
    },
};

export default nextConfig;
