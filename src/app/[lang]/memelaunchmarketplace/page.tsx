import type { Metadata } from 'next';
import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';
import MemeLaunchPage from '../memelaunch/page';
import { MemeLaunchPageProps } from '../memelaunch/page';

export const metadata: Metadata = {
  title: "Meme Launch Marketplace",
  description:
    "Browse and trade meme tokens launched on ZkTerminal. AI-generated characters, community-driven tokens, and Solana-native meme coin trading.",
  openGraph: {
    title: "Meme Launch Marketplace — ZkTerminal",
    description: "Browse and trade AI-generated meme tokens on Solana.",
  },
};

interface MemeLaunchPageServerProps {
  params: Promise<{
    lang: string;
  }>;
}

const MemeLaunchPageServer = async ({ params }: MemeLaunchPageServerProps) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const typedDictionary = dictionary as MemeLaunchPageProps['dictionary'];
  return <MemeLaunchPage dictionary={typedDictionary} />;
};

export default MemeLaunchPageServer;