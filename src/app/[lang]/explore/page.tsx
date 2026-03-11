import type { Metadata } from 'next';
import type { NextPage } from 'next';
import ExploreAgentsPage from "./AgentMarketplace";
import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';
import { ExploreAgentsPageProps } from './AgentMarketplace';

export const metadata: Metadata = {
  title: "Explore AI Agents",
  description:
    "Browse and interact with AI agents on ZkTerminal. Discover trading agents, content generators, and autonomous AI agents built on Solana with zero-knowledge privacy.",
  openGraph: {
    title: "Explore AI Agents — ZkTerminal",
    description: "Browse and interact with AI agents built on Solana with ZK privacy.",
  },
};

interface ExplorePageProps {
  params: {
    lang: Locale;
  };
}

const ExplorePage: NextPage<ExplorePageProps> = async ({ params }) => {
  // Get the dictionary for the current locale
  const dictionary = await getDictionary(params.lang);
  const typedDictionary = dictionary as ExploreAgentsPageProps['dictionary'];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Explore AI Agents",
            description: "Browse and interact with AI trading agents and content generators on ZkTerminal.",
            provider: { "@type": "Organization", name: "ZkAGI" },
          }),
        }}
      />
      <ExploreAgentsPage dictionary={typedDictionary} />
    </>
  );
};

export default ExplorePage;