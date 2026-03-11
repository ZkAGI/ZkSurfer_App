import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Meme Token Launch",
  description:
    "Launch your own meme token on Solana via ZkTerminal. AI-powered character generation, automated Twitter integration, whitelist verification, and on-chain token deployment with PumpFun.",
  openGraph: {
    title: "Meme Token Launch — ZkTerminal",
    description: "Launch meme tokens on Solana with AI character generation and Twitter integration.",
  },
};

export default function MemeLaunchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
