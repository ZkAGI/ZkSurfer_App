
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AarcFundKitModal } from "@aarc-xyz/fundkit-web-sdk";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  buildSolanaPayURLAgents,
  waitForSolanaPayAgents,
} from "@/lib/solanaPayAgents";

/* ─────────────────────────────────────────────────────────────
   PRICING
─────────────────────────────────────────────────────────────── */
const CORE_PRICE = 69;   // per non-trading agent (monthly)
const TRADING_PRICE = 199; // trading agent

/* ─────────────────────────────────────────────────────────────
   ENV
─────────────────────────────────────────────────────────────── */
const AARC_API_KEY = process.env.NEXT_PUBLIC_AARC_API_KEY || "";
const AARC_RECEIVING_EVM = process.env.NEXT_PUBLIC_RECEIVING_WALLET || ""; // 0x...
const AARC_USDC_TOKEN =
  process.env.NEXT_PUBLIC_AARC_USDC_TOKEN ||
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
const AARC_CHAIN_ID = Number(process.env.NEXT_PUBLIC_AARC_CHAIN_ID || 8453); // Base

const SOLANA_RECIPIENT =
  process.env.NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS || ""; // base58
const USDC_SOL_MINT =
  process.env.NEXT_PUBLIC_SOLANA_USDC_MINT_ADDRESS ||
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC

  if (typeof window !== 'undefined') {
  console.log("🔍 PRODUCTION ENV CHECK:", {
    SOLANA_RECIPIENT: SOLANA_RECIPIENT || "EMPTY!",
    USDC_MINT: USDC_SOL_MINT || "EMPTY!",
  });
}

/* ───────────────────────────────────────────────────────────── */

type PaymentsModalProps = {
  open: boolean;
  onClose: () => void;
  selectedAgents: string[]; // e.g., ["BD","Content","Trading"]
  onAllPaid: () => void;
};

type BusyKey = null | "core" | "trading";

export default function PaymentsModal({
  open,
  onClose,
  selectedAgents,
  onAllPaid,
}: PaymentsModalProps) {
  /* what’s in the cart */
  const { hasTrading, nonTrading } = useMemo(() => {
    const hasTrading = selectedAgents.some((a) => a.toLowerCase() === "trading");
    const nonTrading = selectedAgents.filter((a) => a.toLowerCase() !== "trading");
    return { hasTrading, nonTrading };
  }, [selectedAgents]);

  const coreTotal = nonTrading.length * CORE_PRICE;
  const tradingTotal = hasTrading ? TRADING_PRICE : 0;
  const requiresPayment = coreTotal > 0 || tradingTotal > 0;

  /* state */
  const [corePaid, setCorePaid] = useState(coreTotal === 0);
  const [tradingPaid, setTradingPaid] = useState(tradingTotal === 0);
  const [busy, setBusy] = useState<BusyKey>(null);

  // Stripe polling (session opens in a new tab)
  const stripePolling = useRef<{ timer?: number } | null>({});

  // Solana Pay (QR)
  const [solQR, setSolQR] = useState<{
    bucket: BusyKey;
    url: string;
    reference: string;
  } | null>(null);
  const [checkingSol, setCheckingSol] = useState(false);

  const allDone = corePaid && tradingPaid;

  /* recompute paid flags when subtotal changes */
  useEffect(() => {
    setCorePaid(coreTotal === 0);
    setTradingPaid(tradingTotal === 0);
  }, [coreTotal, tradingTotal, open]);

  /* if nothing to pay, finish instantly */
  useEffect(() => {
    if (open && !requiresPayment) onAllPaid();
  }, [open, requiresPayment, onAllPaid]);

  /* ===================== AARC (robust) ===================== */
  // async function aarcPay(bucket: "core" | "trading") {
  //   const amountUsd = bucket === "core" ? coreTotal : tradingTotal;
  //   if (amountUsd <= 0) return;

  //   if (!AARC_API_KEY || !AARC_RECEIVING_EVM) {
  //     toast.error("Aarc not configured (API key / receiving wallet missing).");
  //     return;
  //   }

  //   try {
  //     // Build with destination set in constructor
  //     const modal = new AarcFundKitModal({
  //       apiKey: AARC_API_KEY,
  //       destinationAddress: AARC_RECEIVING_EVM,
  //       destinationTokenAddress: AARC_USDC_TOKEN,
  //       destinationChainId: AARC_CHAIN_ID,
  //       events: {
  //         onTransactionSuccess: () => {
  //           toast.success(
  //             `${bucket === "core" ? "Core agents" : "Trading"} paid via Aarc`
  //           );
  //           bucket === "core" ? setCorePaid(true) : setTradingPaid(true);
  //         },
  //         onTransactionError: (e: any) => {
  //           console.error(e);
  //           toast.error("Aarc payment failed");
  //         },
  //       },
  //     });

  //     // Some SDK versions expose these methods; guard them to avoid runtime errors
  //     try {
  //       // @ts-ignore — method might not exist in your installed version
  //       if (typeof (modal as any).updateRequestedAmountInUSD === "function") {
  //         (modal as any).updateRequestedAmountInUSD(amountUsd);
  //       }
  //       // @ts-ignore — method might not exist in your installed version
  //       if (typeof (modal as any).updateDestinationToken === "function") {
  //         (modal as any).updateDestinationToken(AARC_USDC_TOKEN, AARC_CHAIN_ID, amountUsd);
  //       }
  //     } catch (inner) {
  //       // Swallow; constructor already has destination. User can still set amount in UI.
  //       console.warn("Aarc prefill methods not available in this SDK build.", inner);
  //     }

  //     modal.openModal();
  //   } catch (e: any) {
  //     console.error(e);
  //     toast.error(e?.message || "Failed to open Aarc checkout");
  //   }
  // }

  /* ===================== AARC (v4 config) ===================== */
// function aarcPay(bucket: "core" | "trading") {
//   const amountUsd = bucket === "core" ? coreTotal : tradingTotal;
//   if (amountUsd <= 0) return;

//   if (!AARC_API_KEY || !AARC_RECEIVING_EVM) {
//     toast.error("Aarc not configured (API key / receiving wallet missing).");
//     return;
//   }

//   try {
//     const aarcConfig = {
//       appName: "ZEE Agents",
//       apiKeys: {
//         aarcSDK: AARC_API_KEY,
//       },
//       destination: {
//         walletAddress: AARC_RECEIVING_EVM,
//         token: AARC_USDC_TOKEN,
//         chainId: AARC_CHAIN_ID,
//       },
//       module: {
//         onRamp: {
//           enabled: true,
//           onRampConfig: {
//             customerId: `zee-${Date.now()}`,
//             exchangeScreenTitle: `Pay $${amountUsd} for ${bucket === "core" ? "Core Agents" : "Trading Agent"}`,
//           },
//         },
//         bridgeAndSwap: {
//           enabled: true,
//           fetchOnlyDestinationBalance: false,
//           routeType: "Value",
//         },
//         exchange: {
//           enabled: false,
//         },
//       },
//       events: {
//         onTransactionSuccess: (data: any) => {
//           console.log("Aarc transaction success:", data);
//           toast.success(
//             `${bucket === "core" ? "Core agents" : "Trading"} paid via Aarc`
//           );
//           bucket === "core" ? setCorePaid(true) : setTradingPaid(true);
//         },
//         onTransactionError: (data: any) => {
//           console.error("Aarc transaction error:", data);
//           toast.error("Aarc payment failed");
//         },
//         onWidgetClose: () => {
//           console.log("Aarc widget closed");
//         },
//         onWidgetOpen: () => {
//           console.log("Aarc widget opened");
//         },
//       },
//       origin: typeof window !== "undefined" ? window.location.origin : "",
//     };

//     const modal = new AarcFundKitModal(aarcConfig);
//     modal.openModal();
//   } catch (e: any) {
//     console.error("Aarc error:", e);
//     toast.error(e?.message || "Failed to open Aarc checkout");
//   }
// }

/* ===================== AARC (v4 config) ===================== */
/* ===================== AARC v4 (correct config) ===================== */
function aarcPay(bucket: "core" | "trading") {
  const amountUsd = bucket === "core" ? coreTotal : tradingTotal;
  if (amountUsd <= 0) return;

  if (!AARC_API_KEY || !AARC_RECEIVING_EVM) {
    toast.error("Aarc not configured (API key / receiving wallet missing).");
    return;
  }

  try {
    const config: any = {
      appName: "ZEE Agents",
      dappId: "zee-agents", // ✅ Required in v4
      userId: Date.now().toString(), // ✅ Required in v4 - use unique user ID
      headerText: `Pay $${amountUsd} for ${bucket === "core" ? "Core Agents" : "Trading Agent"}`,
      defaultMode: "exchange", // ✅ Start directly in exchange mode
      apiKeys: {
        aarcSDK: AARC_API_KEY,
      },
      destination: {
        walletAddress: AARC_RECEIVING_EVM,
        tokenAddress: AARC_USDC_TOKEN, // ✅ Required in v4
        chainId: AARC_CHAIN_ID,
        requestedAmountInUSD: amountUsd, // ✅ Set amount here in v4
      },
      module: {
        exchange: {
          enabled: true,
          moduleName: "Pay with Crypto",
        },
        onRamp: {
          enabled: true,
          moduleName: "Pay with Card",
          refundAddress: AARC_RECEIVING_EVM, // ✅ Required in v4
        },
        bridgeAndSwap: {
          enabled: true,
          fetchOnlyDestinationBalance: false,
          routeType: "Value",
        },
        qrPay: {
          enabled: false, // Disable QR for now
        },
      },
      events: {
        onTransactionSuccess: (data: any) => {
          console.log("Aarc transaction success:", data);
          toast.success(
            `${bucket === "core" ? "Core agents" : "Trading"} paid via Aarc`
          );
          bucket === "core" ? setCorePaid(true) : setTradingPaid(true);
        },
        onTransactionError: (data: any) => {
          console.error("Aarc transaction error:", data);
          toast.error("Aarc payment failed");
        },
        onWidgetClose: () => {
          console.log("Aarc widget closed");
        },
        onWidgetOpen: () => {
          console.log("Aarc widget opened");
        },
      },
      origin: typeof window !== "undefined" ? window.location.origin : "",
    };

    const modal = new AarcFundKitModal(config);
    modal.openModal();
  } catch (e: any) {
    console.error("Aarc error:", e);
    toast.error(e?.message || "Failed to open Aarc checkout");
  }
}

  /* ===================== Solana Pay (QR) with 404 fallback ===================== */
  async function solanaStart(bucket: "core" | "trading") {
    const amount = bucket === "core" ? coreTotal : tradingTotal;
    if (amount <= 0) return;

    if (!SOLANA_RECIPIENT) {
      toast.error("Missing NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS");
      return;
    }

    let reference: string | null = null;

    // 1) try your API route first
    try {
      const r = await fetch("/api/solana/createAgentReference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket,
          agents: bucket === "core" ? nonTrading : ["Trading"],
          amountUsd: amount,
        }),
      });

      if (r.ok) {
        const j = await r.json();
        reference = j?.reference || null;
      } else {
        // capture 404 html page or other
        const txt = await r.text().catch(() => "");
        console.warn("createAgentReference not available, falling back. Body:", txt);
      }
    } catch (e) {
      console.warn("createAgentReference fetch failed, using local fallback.", e);
    }

    // 2) fallback: generate client-side reference
    if (!reference) {
      reference = Keypair.generate().publicKey.toBase58();
    }

    // Build Solana Pay URL
    const refKey = new PublicKey(reference);
    const url = buildSolanaPayURLAgents({
      usdAmount: amount,
      recipient: new PublicKey(SOLANA_RECIPIENT),
      usdcMint: new PublicKey(USDC_SOL_MINT),
      reference: refKey,
      label:
        bucket === "core"
          ? `ZEE Core x${nonTrading.length} ($${CORE_PRICE}/mo)`
          : "ZEE Trading ($199)",
      message: "ZEE Agent purchase",
    });

    setSolQR({ bucket, url: url.toString(), reference });
  }

  async function solanaCheck() {
    if (!solQR?.reference) return;
    setCheckingSol(true);
    try {
      const amount = solQR.bucket === "core" ? coreTotal : tradingTotal;

      const ok = await waitForSolanaPayAgents({
        reference: new PublicKey(solQR.reference),
        expectedUsd: amount,
        usdcMint: new PublicKey(USDC_SOL_MINT),
        recipient: new PublicKey(SOLANA_RECIPIENT),
      });

      if (ok) {
        toast.success(
          `${solQR.bucket === "core" ? "Core agents" : "Trading"} paid via Solana`
        );
        solQR.bucket === "core" ? setCorePaid(true) : setTradingPaid(true);
        setSolQR(null);
      } else {
        toast.error("Payment not found yet. Try again in a few seconds.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not confirm Solana payment");
    } finally {
      setCheckingSol(false);
    }
  }

  /* ===================== Stripe (Core only) ===================== */
  async function stripePayCore() {
    const amount = coreTotal;
    if (amount <= 0) return;

    try {
      const res = await fetch("/api/stripe/create-agent-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "core",
          amountUsd: amount,
          items: nonTrading,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url || !data?.id) {
        throw new Error(data?.error || "Failed to init Stripe");
      }

      // open in a new tab so the modal stays open
      window.open(data.url, "_blank", "noopener,noreferrer");

      // poll confirmation
      let tries = 0;
      const max = 30; // ~60s @ 2s interval
      const tick = async () => {
        tries++;
        const r = await fetch(
          `/api/stripe/confirm-agent-session?sessionId=${encodeURIComponent(
            data.id as string
          )}`
        );
        const j = await r.json().catch(() => ({}));
        if (j?.paid) {
          toast.success("Core agents paid via Stripe");
          setCorePaid(true);
          if (stripePolling.current?.timer)
            window.clearTimeout(stripePolling.current.timer);
          return;
        }
        if (tries < max) {
          stripePolling.current!.timer = window.setTimeout(tick, 2000);
        } else {
          toast.error("Stripe payment not confirmed yet. You can try again.");
        }
      };
      tick();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Stripe init failed");
    }
  }

  /* ===================== Dispatcher ===================== */
  const pay = async (
    bucket: "core" | "trading",
    method: "aarc" | "solana" | "stripe"
  ) => {
    try {
      setBusy(bucket);
      if (method === "aarc") await aarcPay(bucket);
      if (method === "solana") await solanaStart(bucket);
      if (method === "stripe") {
        if (bucket === "core") await stripePayCore();
        else toast.error("Stripe is not available for the Trading agent.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Payment failed");
    } finally {
      setBusy(null);
    }
  };

  /* ===================== UI ===================== */
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-[300]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[310] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
          >
            <div
              className="w-full max-w-3xl bg-[#0D0F1E] border border-[#2A2F5E] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#2A2F5E] flex items-center justify-between">
                <h3 className="text-xl font-semibold">Checkout</h3>
                <button
                  className="text-sm opacity-70 hover:opacity-100"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>

              {/* Body */}
              <div className="p-6 grid gap-6">
                {/* Core */}
                {nonTrading.length > 0 && (
                  <section className="rounded-xl border border-[#2A2F5E] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-gray-400">Core Agents</div>
                        <div className="font-semibold">
                          {nonTrading.length} item
                          {nonTrading.length > 1 ? "s" : ""} × ${CORE_PRICE}/mo
                        </div>
                        <div className="text-xs text-gray-400">
                          {nonTrading.join(", ")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Subtotal</div>
                        <div className="text-lg font-semibold">${coreTotal}</div>
                      </div>
                    </div>

                    {corePaid ? (
                      <div className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
                        ✓ Paid
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {/* <button
                          disabled={busy === "core"}
                          onClick={() => pay("core", "aarc")}
                          className="px-4 py-2 rounded-xl bg-[#141736] border border-[#2A2F5E] hover:border-purple-500"
                        >
                          Pay with Aarc
                        </button> */}
                        <button
                          disabled={busy === "core"}
                          onClick={() => pay("core", "solana")}
                          className="px-4 py-2 rounded-xl bg-[#141736] border border-[#2A2F5E] hover:border-purple-500"
                        >
                          Solana Pay
                        </button>
                        {/* Stripe allowed ONLY for Core */}
                        {/* <button
                          disabled={busy === "core"}
                          onClick={() => pay("core", "stripe")}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
                        >
                          Stripe
                        </button> */}
                      </div>
                    )}
                  </section>
                )}

                {/* Trading */}
                {hasTrading && (
                  <section className="rounded-xl border border-[#2A2F5E] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-gray-400">Trading Agent</div>
                        <div className="font-semibold">
                          1 item × ${TRADING_PRICE}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Subtotal</div>
                        <div className="text-lg font-semibold">
                          ${tradingTotal}
                        </div>
                      </div>
                    </div>

                    {tradingPaid ? (
                      <div className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
                        ✓ Paid
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {/* <button
                          disabled={busy === "trading"}
                          onClick={() => pay("trading", "aarc")}
                          className="px-4 py-2 rounded-xl bg-[#141736] border border-[#2A2F5E] hover:border-purple-500"
                        >
                          Pay with Aarc
                        </button> */}
                        <button
                          disabled={busy === "trading"}
                          onClick={() => pay("trading", "solana")}
                          className="px-4 py-2 rounded-xl bg-[#141736] border border-[#2A2F5E] hover:border-purple-500"
                        >
                          Solana Pay
                        </button>
                        {/* No Stripe for Trading */}
                      </div>
                    )}
                  </section>
                )}

                {/* Solana QR (after choosing Solana) */}
                {solQR && (
                  <section className="rounded-xl border border-[#2A2F5E] p-4">
                    <div className="mb-3 font-semibold">
                      Scan with your Solana wallet ({solQR.bucket})
                    </div>
                    <div className="bg-white p-3 rounded-lg inline-block">
                      <QRCode value={solQR.url} size={200} />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setSolQR(null)}
                        className="px-4 py-2 rounded-lg bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={solanaCheck}
                        disabled={checkingSol}
                        className="px-4 py-2 rounded-lg bg-emerald-600 disabled:opacity-50"
                      >
                        {checkingSol ? "Checking..." : "I’ve paid, check"}
                      </button>
                    </div>
                  </section>
                )}

                {/* Summary */}
                <section className="rounded-xl border border-[#2A2F5E] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">Total</div>
                    <div className="text-2xl font-semibold">
                      ${coreTotal + tradingTotal}
                    </div>
                  </div>
                  {/* <div className="mt-2 text-xs text-gray-500">
                    * Success appears only after all required payments are completed.
                  </div> */}
                </section>

                <div className="flex justify-end">
                  <button
                    disabled={!allDone}
                    onClick={onAllPaid}
                    className={`px-5 py-3 rounded-xl ${
                      allDone
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                        : "bg-gray-600 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {allDone ? "Finish" : "Complete payments to finish"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

