import type { Metadata } from 'next';
import type { NextPage } from 'next';
import MarketplacePage from "./MemeMarketplace";
import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';
import { MarketplacePageProps } from './MemeMarketplace';

export const metadata: Metadata = {
  title: "AI Coin Marketplace",
  description:
    "Trade meme coins and AI-generated tokens on ZkTerminal's marketplace. Real-time pricing, market cap data, and Solana-native token trading with integrated wallet support.",
  openGraph: {
    title: "AI Coin Marketplace — ZkTerminal",
    description: "Trade meme coins and AI tokens on Solana with real-time pricing and market data.",
  },
};

interface ExplorePageProps {
    params: {
        lang: Locale;
    };
}

const MemeMarketplacePage: NextPage<ExplorePageProps> = async ({ params }) => {
    // Get the dictionary for the current locale
    const dictionary = await getDictionary(params.lang);
    const typedDictionary = dictionary as MarketplacePageProps['dictionary'];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        name: "AI Coin Marketplace",
                        description: "Trade meme coins and AI-generated tokens on Solana with real-time pricing.",
                        provider: { "@type": "Organization", name: "ZkAGI" },
                    }),
                }}
            />
            <MarketplacePage dictionary={typedDictionary} />
        </>
    );
};

export default MemeMarketplacePage;
