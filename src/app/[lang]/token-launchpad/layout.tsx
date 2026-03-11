import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Token Launchpad",
  description:
    "Create and deploy ERC-20 tokens on Ethereum and Base networks via ZkTerminal. No-code token creation with customizable name, symbol, supply, and automatic deployment using a connected wallet.",
  openGraph: {
    title: "Token Launchpad — ZkTerminal",
    description: "No-code ERC-20 token creation on Ethereum and Base. Deploy tokens from your wallet.",
  },
};

export default function TokenLaunchpadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
