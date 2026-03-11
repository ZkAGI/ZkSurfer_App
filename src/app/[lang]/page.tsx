// import type { NextPage } from 'next';
// import HomeContent from '../home/HomeContent';
// import { getDictionary } from '../i18n/dictionaries';
// import { Locale } from '../i18n/settings';

// interface HomePageProps {
//   params: {
//     lang: Locale;
//   };
// }

// const Home: NextPage<HomePageProps> = async ({ params }) => {
//   // Get the dictionary for the current locale
//   const dictionary = await getDictionary(params.lang);

//   // Pass the dictionary to your HomeContent component
//   return <HomeContent dictionary={dictionary} />;
// };

// export default Home;


import type { Metadata } from 'next';
import type { NextPage } from 'next';
import HomeContent from './home/HomeContent';

export const metadata: Metadata = {
  title: "ZkTerminal — AI-Powered Web3 Terminal with ZK Privacy",
  description:
    "ZkTerminal by ZkAGI: create AI agents, launch tokens on Solana, trade prediction markets, and generate zero-knowledge proofs. Privacy-preserving Web3 terminal with multi-chain wallet support.",
  openGraph: {
    title: "ZkTerminal — AI-Powered Web3 Terminal with ZK Privacy",
    description:
      "Create AI agents, launch tokens, trade predictions, and generate ZK proofs on Solana. Privacy-preserving Web3 terminal by ZkAGI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZkTerminal — AI-Powered Web3 Terminal with ZK Privacy",
    description:
      "Create AI agents, launch tokens, trade predictions, and generate ZK proofs on Solana.",
  },
};

interface HomePageProps {
  params: Promise<{
    lang: string;
  }>;
}

const Home: NextPage<HomePageProps> = async () => {
  return <HomeContent />;
};

export default Home;