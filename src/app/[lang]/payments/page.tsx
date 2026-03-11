import type { Metadata } from 'next';
import PaymentsPage from './PaymentsPage';

export const metadata: Metadata = {
  title: "Pricing & Payments",
  description:
    "ZkTerminal subscription plans and pricing. Pay with Stripe or Solana Pay (USDC). Monthly and yearly plans for AI agent creation, token launches, and premium features.",
  openGraph: {
    title: "Pricing & Payments — ZkTerminal",
    description: "Subscription plans with Stripe and Solana Pay. AI agents, token launches, and premium features.",
  },
};

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        name: "ZkTerminal",
                        applicationCategory: "DeveloperApplication",
                        operatingSystem: "Web",
                        description: "Privacy-preserving AI agents and Web3 tools on Solana.",
                        provider: { "@type": "Organization", name: "ZkAGI" },
                        offers: [
                            {
                                "@type": "Offer",
                                name: "Monthly Plan",
                                priceCurrency: "USD",
                                description: "Monthly subscription for ZkTerminal premium features.",
                            },
                            {
                                "@type": "Offer",
                                name: "Yearly Plan",
                                priceCurrency: "USD",
                                description: "Yearly subscription for ZkTerminal premium features.",
                            },
                        ],
                    }),
                }}
            />
            <PaymentsPage />
        </>
    );
}