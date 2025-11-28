import type { Metadata } from "next";
import { NewUserRedirect } from "@/components/auth/NewUserRedirect";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
    title: "Fread",
    description: "A social media platform for sharing and discovering content.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`antialiased`}>
                <Providers>
                    <NewUserRedirect />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
