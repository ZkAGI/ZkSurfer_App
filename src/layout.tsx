import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/component/AppWalletProvider";
import Providers from "@/component/Provider";
import '../../polyfills';
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "ZkTerminal";
const APP_DEFAULT_TITLE = "ZkTerminal — AI-Powered Web3 Terminal with ZK Privacy";
const APP_TITLE_TEMPLATE = "%s — ZkTerminal";
const APP_DESCRIPTION =
  "ZkTerminal by ZkAGI: privacy-preserving AI agents, token launchpad, prediction markets, and meme coin marketplace on Solana. Create AI agents, generate ZK proofs, trade predictions, and launch tokens — all with zero-knowledge privacy.";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zk-surfer-app-git-main-zkagi-team.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "ZkTerminal", "ZkAGI", "AI agents", "zero-knowledge proofs",
    "Solana", "token launchpad", "prediction market", "meme coins",
    "privacy AI", "Web3", "DeFi", "ZK proofs", "Zynapse"
  ],
  authors: [{ name: "ZkAGI", url: SITE_URL }],
  creator: "ZkAGI",
  publisher: "ZkAGI",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/images/512x512.png", width: 512, height: 512, alt: "ZkTerminal Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ["/images/512x512.png"],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: `${SITE_URL}/en`,
      ko: `${SITE_URL}/ko`,
      vi: `${SITE_URL}/vi`,
      zh: `${SITE_URL}/zh`,
      tr: `${SITE_URL}/tr`,
    },
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#152376",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "ZkAGI",
      "url": SITE_URL,
      "logo": `${SITE_URL}/images/512x512.png`,
      "description": "ZkAGI builds privacy-preserving AI infrastructure using zero-knowledge proofs on Solana.",
      "sameAs": []
    },
    {
      "@type": "SoftwareApplication",
      "name": "ZkTerminal",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web",
      "description": APP_DESCRIPTION,
      "url": SITE_URL,
      "provider": {
        "@type": "Organization",
        "name": "ZkAGI"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free tier available. Premium plans with Stripe and Solana Pay."
      },
      "featureList": [
        "AI Agent Creation and Management",
        "Zero-Knowledge Proof Generation",
        "Token Launchpad on Solana",
        "Meme Coin Marketplace",
        "Prediction Markets and Trading",
        "Privacy-Preserving AI Inference",
        "Multi-chain Wallet Support (Solana, Ethereum)",
        "Knowledge Base with IPFS Storage",
        "Voice Cloning and Video Generation",
        "PnL Tracking Dashboard"
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
