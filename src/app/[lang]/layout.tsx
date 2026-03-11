import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/component/AppWalletProvider";
import Providers from "@/component/Provider";
import '../../../polyfills';
import { Toaster } from "sonner";
import { getDictionary } from "../i18n/dictionaries";
import { locales, Locale } from "../i18n/settings";
import MultiWalletProvider from '../../component/MulttiWalletProvider';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#152376",
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
  params: { lang: Locale };
}>) {
  // Get the dictionary for the current locale
  const dictionary = await getDictionary(params.lang);

  return (
    <html lang={params.lang} dir="ltr">
      <head />
      <body className={inter.className}>
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
      </body>
    </html>
  );
}