import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "../globals.css";
import AppWalletProvider from "@/component/AppWalletProvider";
import Providers from "@/component/Provider";
// import '../../polyfills';
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "ZkTerminal";
const APP_DEFAULT_TITLE = "ZkTerminal - Solana PWA App";
const APP_TITLE_TEMPLATE = "%s - ZkTerminal";
const APP_DESCRIPTION = "ZkTerminal - A PWA-enabled Solana dApp";

export const metadata: Metadata = {
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: APP_DEFAULT_TITLE,
    },
    formatDetection: { telephone: false },
    openGraph: {
        type: "website",
        siteName: APP_NAME,
        title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
        description: APP_DESCRIPTION,
    },
    twitter: {
        card: "summary",
        title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
        description: APP_DESCRIPTION,
    },
    manifest: "/manifest.json",
};

export default async function RootLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    return (
        <html lang={locale} dir="ltr">
            <head />
            <body className={inter.className}>
                <Providers>
                    <AppWalletProvider>
                        {children}
                        <Toaster position="top-right" richColors />
                    </AppWalletProvider>
                </Providers>
            </body>
        </html>
    );
}
