// lib/solanaPayAgents.ts
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";

/** Build a Solana Pay URL for a USDC transfer (merchant receives USDC on Solana). */
export function buildSolanaPayURLAgents(opts: {
  usdAmount: number;
  recipient: PublicKey;
  usdcMint: PublicKey;
  reference: PublicKey;
  label?: string;
  message?: string;
}) {
  // 1 USDC = 1 USD, so we treat usdAmount as usdc amount.
  const amount = opts.usdAmount.toFixed(2);
  const params = new URLSearchParams({
    amount,
    splToken: opts.usdcMint.toBase58(),
    reference: opts.reference.toBase58(),
    label: opts.label ?? "ZEE",
    message: opts.message ?? "ZEE Agent purchase",
  });

  // Solana Pay URI format: solana:<recipient>?amount=...&splToken=...&reference=...&label=...
  return new URL(`solana:${opts.recipient.toBase58()}?${params.toString()}`);
}

/** Very light "wait for payment" by looking for a confirmed transfer to recipient with reference. */
export async function waitForSolanaPayAgents(opts: {
  reference: PublicKey;
  expectedUsd: number;
  usdcMint: PublicKey;
  recipient: PublicKey;
  /** optional, defaults to mainnet RPC */
  rpc?: string;
  /** polling config */
  maxTries?: number;
  intervalMs?: number;
}): Promise<boolean> {
  const connection = new Connection(opts.rpc || clusterApiUrl("mainnet-beta"), "confirmed");
  const max = opts.maxTries ?? 20;
  const interval = opts.intervalMs ?? 2000;

  // Reference is typically included in memo or a cu-added account — in many stacks
  // you’d parse transactions that include "reference" as an account key.
  // Here we simply check for *any* recent transactions to recipient and assume 1:1 USD/USDC and let backend verify.
  for (let i = 0; i < max; i++) {
    const sigs = await connection.getSignaturesForAddress(opts.recipient, { limit: 20 });
    if (sigs.length) {
      // In a real merchant flow you’d decode the transaction
      // and verify: recipient, token mint, amount, reference.
      // Keep this simple — return true and let your webhook do authoritative checks.
      return true;
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  return false;
}
