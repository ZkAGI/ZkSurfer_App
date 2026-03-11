import type { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "ZkTerminal dashboard: access AI agent creation, image generation, token launches, ZK proof generation, and privacy-preserving AI tools from a unified command interface.",
  openGraph: {
    title: "ZkTerminal Dashboard",
    description: "Unified command interface for AI agents, token launches, and ZK proofs on Solana.",
  },
};

export default function Home() {
    return <HomeContent />;
}