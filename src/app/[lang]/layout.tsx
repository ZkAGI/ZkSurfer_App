import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans, DM_Mono, Syne } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/component/AppWalletProvider";
import Providers from "@/component/Provider";
import '../../../polyfills';
import { Toaster } from "sonner";
import { getDictionary } from "../i18n/dictionaries";
import { locales, Locale } from "../i18n/settings";
import MultiWalletProvider from '../../component/MulttiWalletProvider';
import AarcProvider from '../../component/ui/AarcProvider';
import { PrivyProvider } from '@privy-io/react-auth';

const inter = Inter({ subsets: ["latin"] });

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

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
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

// Generate static params for each locale
export async function generateStaticParams() {
  return locales.map(lang => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  // Get the dictionary for the current locale
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <html lang={lang} dir="ltr">
      <head />
      <body className={`${inter.className} ${dmSans.variable} ${dmMono.variable} ${syne.variable} bg-dsBg min-h-screen`}>
        {/* Global background glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(124, 106, 247, 0.15), transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(52, 211, 153, 0.12), transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="relative z-10">
          <Providers>
            <MultiWalletProvider>
              {/* <AarcProvider> */}
                <AppWalletProvider>
                  {/* <AarcProvider> */}
                  {children}
                  <Toaster position="top-right" richColors />
                  {/* </AarcProvider> */}
                </AppWalletProvider>
              {/* </AarcProvider> */}
            </MultiWalletProvider>
          </Providers>
        </div>
      </body>
    </html>
  );
}