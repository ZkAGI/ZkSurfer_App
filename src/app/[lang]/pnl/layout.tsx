import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "PnL Dashboard",
  description:
    "Track profit and loss across your HyperLiquid trades on ZkTerminal. Daily, monthly, and all-time PnL charts with per-token breakdowns and cumulative performance tracking.",
  openGraph: {
    title: "PnL Dashboard — ZkTerminal",
    description: "Track trading PnL with daily, monthly, and all-time charts on HyperLiquid.",
  },
};

export default function PnlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
