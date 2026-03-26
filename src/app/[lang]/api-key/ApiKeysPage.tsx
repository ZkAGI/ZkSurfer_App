"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from 'sonner';
import { useModelStore } from "@/stores/useModel-store";
import { z } from "zod";

const purchaseSchema = z
  .string()
  .min(1, "Enter an amount")
  .transform((val) => parseFloat(val))
  .refine((val) => !isNaN(val), "Must be a valid number")
  .refine((val) => val > 0, "Amount must be greater than 0")
  .refine((val) => val <= 10000, "Maximum amount is $10,000");
import {
  Key, Plus, ArrowLeft, Wallet, Copy, Check, Trash2, Zap, X,
  Terminal, Settings, LayoutGrid, Menu, HelpCircle, Shield
} from "lucide-react";
import { CustomWalletButton } from '@/component/ui/CustomWalletButton';

const API_KEYS_URL = "https://zynapse.zkagi.ai/get-api-keys-by-wallet";
const DELETE_API_KEY_URL = "https://zynapse.zkagi.ai/delete-api-key";
const BALANCE_API_URL = "https://zynapse.zkagi.ai/v1/check-balance";
const CREATE_API_KEY_URL = "https://zynapse.zkagi.ai/generate-api-key";
const API_KEY = "zk-123321";

const NAV = [
  { icon: LayoutGrid, label: "ZkTerminal", href: "/home" },
  { icon: Key, label: "API Keys", href: "/api-key", active: true },
];

interface ApiKeysPageProps {
    dictionary: any;
}

export default function ApiKeysPage({ dictionary }: ApiKeysPageProps) {
    const { publicKey } = useWallet();
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string || 'en';

    const globalCredits = useModelStore((s) => s.credits);
    const globalApiKey = useModelStore((s) => s.apiKey);
    const setGlobalCredits = useModelStore((s) => s.setCredits);
    const setGlobalApiKey = useModelStore((s) => s.setApiKey);
    const selectedModel = useModelStore((s) => s.selectedModel);

    const [apiKeys, setApiKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [purchaseAmount, setPurchaseAmount] = useState("");
    const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (publicKey) {
            fetchApiKeys();
        }
    }, [publicKey]);

    const fetchApiKeys = async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            const response = await fetch(API_KEYS_URL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Thunder Client",
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ wallet_address: publicKey.toString() }),
            });
            if (!response.ok) throw new Error("Failed to fetch API keys");
            const data = await response.json();
            const keys = data.api_keys || [];
            setApiKeys(keys);
            if (keys.length > 0) {
                setAuthToken(keys[0]);
                setGlobalApiKey(keys[0]);
                fetchCredits(keys[0]);
            }
        } catch (error) {
            console.error("Error fetching API keys:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCredits = async (token: string) => {
        try {
            const response = await fetch(BALANCE_API_URL, {
                method: "GET",
                headers: {
                    "Accept": "/",
                    "User-Agent": "Thunder Client",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error("Failed to fetch balance");
            const data = await response.json();
            setGlobalCredits(data.credit_balance || 0);
        } catch (error) {
            console.error("Error fetching credits:", error);
            setGlobalCredits(0);
        }
    };

    const deleteApiKey = async (apiKey: string) => {
        if (!publicKey) return;
        try {
            const response = await fetch(DELETE_API_KEY_URL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Thunder Client",
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    wallet_address: publicKey.toString(),
                    api_key: apiKey,
                }),
            });
            if (!response.ok) throw new Error("Failed to delete API key");
            const updatedKeys = apiKeys.filter((key) => key !== apiKey);
            setApiKeys(updatedKeys);
            if (apiKey === authToken) {
                setAuthToken(updatedKeys.length > 0 ? updatedKeys[0] : null);
                if (updatedKeys.length > 0) {
                    setGlobalApiKey(updatedKeys[0]);
                    fetchCredits(updatedKeys[0]);
                } else {
                    setGlobalApiKey('');
                    setGlobalCredits(0);
                }
            }
            toast.success("API Key deleted!");
        } catch (error) {
            console.error("Error deleting API key:", error);
        }
    };

    const createApiKey = async () => {
        if (!publicKey) return;
        try {
            const response = await fetch(CREATE_API_KEY_URL, {
                method: "POST",
                headers: {
                    "Accept": "/",
                    "User-Agent": "Thunder Client",
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ wallet_address: publicKey.toString() }),
            });
            if (!response.ok) throw new Error("Failed to create API key");
            const generateKeyData = await response.json();
            if (generateKeyData.api_key) {
                setApiKeys((prev) => [...prev, generateKeyData.api_key]);
                if (apiKeys.length === 0) {
                    setGlobalApiKey(generateKeyData.api_key);
                    fetchCredits(generateKeyData.api_key);
                }
            }
            toast.success("API Key created!");
        } catch (error) {
            console.error("Error creating API key:", error);
        }
    };

    const copyToClipboard = async (key: string) => {
        try {
            await navigator.clipboard.writeText(key);
            setCopiedKey(key);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopiedKey(null), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleBuy = async () => {
        if (!publicKey) return;

        const result = purchaseSchema.safeParse(purchaseAmount);
        if (!result.success) {
            toast.error(result.error.errors[0].message);
            return;
        }
        const amountUsd = result.data;

        try {
            const res = await fetch("https://zynapse.zkagi.ai/v1/initiate-payment", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "api-key": API_KEY,
                },
                body: JSON.stringify({
                    wallet_address: publicKey.toString(),
                    amount_usd: amountUsd,
                }),
            });
            const { payment_url } = await res.json();
            const url = new URL(payment_url);
            const iid = url.searchParams.get("iid");
            if (iid) {
                setWidgetUrl(`https://nowpayments.io/embeds/payment-widget?iid=${iid}`);
            }
        } catch (err) {
            console.error("initiate-payment error:", err);
            toast.error("Payment initiation failed");
        } finally {
            setShowPurchaseModal(false);
            setPurchaseAmount("");
        }
    };

    return (
      <div style={{
        display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif",
        background: "#07090f", color: "#e2e8f0", overflow: "hidden",
      }}>
        {/* Mobile Header */}
        {isMobile && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
            background: "rgba(7,9,15,0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Menu size={20} color="#e2e8f0" />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: "linear-gradient(135deg, #7c6af7, #4338ca)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Terminal size={12} color="#fff" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>ZkTerminal</span>
            </div>
            <CustomWalletButton />
          </div>
        )}

        {/* Sidebar Overlay for Mobile */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* SIDEBAR */}
        <aside style={{
          width: isMobile ? 280 : 216,
          flexShrink: 0,
          background: "#0b0d16",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          ...(isMobile ? {
            position: "fixed", left: sidebarOpen ? 0 : -280, top: 0, bottom: 0, zIndex: 110,
            transition: "left 0.2s ease",
          } : {}),
        }}>
          {/* Logo */}
          <div style={{
            padding: "15px 13px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: "linear-gradient(135deg, #7c6af7, #4338ca)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 16px rgba(124,106,247,0.4)",
                flexShrink: 0,
              }}>
                <Terminal size={13} color="#fff" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.3px" }}>
                ZkTerminal
              </span>
            </div>
            {isMobile ? (
              <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} color="#6b7280" />
              </button>
            ) : (
              <Settings size={14} color="#374151" style={{ cursor: "pointer" }} />
            )}
          </div>

          {/* Navigation */}
          <div style={{
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#374151", padding: "10px 14px 4px",
          }}>Navigation</div>

          {NAV.map((item) => (
            <div
              key={item.label}
              onClick={() => {
                router.push(`/${lang}${item.href}`);
                if (isMobile) setSidebarOpen(false);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "7px 12px", margin: "1px 6px",
                borderRadius: 8, cursor: "pointer",
                color: item.active ? "#a78bfa" : "#6b7280",
                background: item.active ? "rgba(167,139,250,0.08)" : "transparent",
                fontSize: 13, fontWeight: item.active ? 600 : 400,
                transition: "all 0.12s",
                position: "relative",
              }}
            >
              {item.active && (
                <div style={{
                  position: "absolute", left: -6, top: "50%",
                  transform: "translateY(-50%)",
                  width: 3, height: 16,
                  background: "#7c6af7",
                  borderRadius: "0 3px 3px 0",
                }} />
              )}
              <item.icon size={14} />
              <span>{item.label}</span>
            </div>
          ))}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Help */}
          <a href="https://docs.zkagi.ai" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{
              margin: "0 9px 6px", padding: "10px 12px",
              background: "rgba(52,211,153,0.04)",
              border: "1px solid rgba(52,211,153,0.08)",
              borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(52,211,153,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <HelpCircle size={13} color="#34d399" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#34d399" }}>Need Help?</div>
                <div style={{ fontSize: 11, color: "#374151" }}>Check our docs</div>
              </div>
            </div>
          </a>

          {/* Credits Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: 10,
          }}>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10, padding: "11px 13px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#374151" }}>Credits</span>
                <Wallet size={12} color="#374151" />
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: "#34d399", marginTop: 2 }}>
                {globalCredits?.toFixed(2) || "0.00"}
              </div>
              <div style={{ fontSize: 11, color: "#374151", marginTop: 1 }}>
                ~{Math.floor((globalCredits || 0) * 5)} generations remaining
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 99, marginTop: 9, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${Math.min((globalCredits || 0) / 20 * 100, 100)}%`,
                  background: "linear-gradient(90deg, #34d399, #059669)",
                  borderRadius: 99,
                }} />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{
          flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
          background: "#07090f", position: "relative",
          marginTop: isMobile ? 56 : 0,
        }}>
          {/* Background glows */}
          <div style={{
            position: "absolute", width: 500, height: 500,
            background: "radial-gradient(circle, #7c6af7, transparent 70%)",
            opacity: 0.04, top: -80, left: "26%",
            pointerEvents: "none", borderRadius: "50%", zIndex: 0,
          }} />

          {/* Topbar */}
          {!isMobile && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 22px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(7,9,15,0.9)",
              backdropFilter: "blur(14px)",
              zIndex: 20, flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(124,106,247,0.08)",
                  border: "1px solid rgba(124,106,247,0.15)",
                  padding: "6px 14px", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, color: "#a78bfa",
                }}>
                  <Key size={14} />
                  API Key Management
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.12)",
                  padding: "6px 14px", borderRadius: 10,
                  fontSize: 12, fontWeight: 500, color: "#34d399",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  <Wallet size={13} />
                  {globalCredits?.toFixed(2) || "0.00"} credits
                </div>
                <CustomWalletButton />
              </div>
            </div>
          )}

          {/* Scrollable Content */}
          <div style={{ flex: 1, overflow: "auto", position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>

              {/* Page Header */}
              <div style={{ marginBottom: 32 }}>
                <h1 style={{
                  fontSize: 28, fontWeight: 700, color: "#f1f5f9",
                  fontFamily: "'Syne', sans-serif", marginBottom: 8,
                }}>
                  API Keys
                </h1>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                  Manage your Zynapse API keys. Create, activate, and delete keys for accessing ZkAGI services.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                <button
                  onClick={createApiKey}
                  disabled={!publicKey}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 20px", borderRadius: 10,
                    background: "linear-gradient(135deg, #7c6af7, #4338ca)",
                    border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: publicKey ? "pointer" : "not-allowed",
                    opacity: publicKey ? 1 : 0.5,
                    boxShadow: "0 4px 16px rgba(124,106,247,0.3)",
                    transition: "all 0.15s",
                  }}
                >
                  <Plus size={16} />
                  Create API Key
                </button>
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={!publicKey}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 20px", borderRadius: 10,
                    background: "rgba(52,211,153,0.08)",
                    border: "1px solid rgba(52,211,153,0.2)",
                    color: "#34d399", fontSize: 13, fontWeight: 600,
                    cursor: publicKey ? "pointer" : "not-allowed",
                    opacity: publicKey ? 1 : 0.5,
                    transition: "all 0.15s",
                  }}
                >
                  <Zap size={16} />
                  Buy Credits
                </button>
              </div>

              {/* Security Info Banner */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                background: "rgba(124,106,247,0.04)",
                border: "1px solid rgba(124,106,247,0.12)",
                borderRadius: 14, padding: "16px 18px",
                marginBottom: 24,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(124,106,247,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Shield size={16} color="#a78bfa" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>API Key Security</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                    Your API keys grant access to ZkAGI services. Keep them secure and never share publicly.
                    If compromised, delete and regenerate immediately.
                  </div>
                </div>
              </div>

              {/* Active Key Card */}
              {globalApiKey && (
                <div style={{
                  background: "rgba(52,211,153,0.03)",
                  border: "1px solid rgba(52,211,153,0.15)",
                  borderRadius: 14, padding: "18px 20px",
                  marginBottom: 24,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#34d399", boxShadow: "0 0 8px #34d399",
                        animation: "blink 1.4s infinite",
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#34d399" }}>Active API Key</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(globalApiKey)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 12px", borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: copiedKey === globalApiKey ? "#34d399" : "#6b7280",
                        fontSize: 12, fontWeight: 500, cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {copiedKey === globalApiKey ? <Check size={13} /> : <Copy size={13} />}
                      {copiedKey === globalApiKey ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <code style={{
                    display: "block", fontFamily: "'DM Mono', monospace",
                    fontSize: 13, color: "rgba(255,255,255,0.85)",
                    background: "rgba(0,0,0,0.3)",
                    padding: "12px 14px", borderRadius: 10,
                    wordBreak: "break-all",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    {globalApiKey}
                  </code>
                </div>
              )}

              {/* Not connected state */}
              {!publicKey && (
                <div style={{
                  textAlign: "center", padding: "60px 20px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                    background: "rgba(124,106,247,0.08)",
                    border: "1px solid rgba(124,106,247,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Wallet size={24} color="#6b7280" />
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
                    Connect Your Wallet
                  </h4>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>
                    Connect a Solana wallet to manage your API keys
                  </p>
                </div>
              )}

              {/* API Keys List */}
              {publicKey && (
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16, overflow: "hidden",
                }}>
                  {/* Table Header */}
                  <div style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>All API Keys</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{apiKeys.length} key{apiKeys.length !== 1 ? 's' : ''}</span>
                  </div>

                  {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 10, color: "#6b7280" }}>
                      <div style={{
                        width: 20, height: 20, border: "2px solid rgba(124,106,247,0.2)",
                        borderTopColor: "#7c6af7", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }} />
                      Loading API keys...
                    </div>
                  ) : apiKeys.length > 0 ? (
                    <div>
                      {apiKeys.map((api_key, index) => (
                        <div
                          key={api_key}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 20px",
                            borderBottom: index < apiKeys.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                            transition: "background 0.12s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: "rgba(255,255,255,0.04)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 600, color: "#6b7280",
                              fontFamily: "'DM Mono', monospace", flexShrink: 0,
                            }}>
                              {index + 1}
                            </div>
                            <code style={{
                              fontFamily: "'DM Mono', monospace", fontSize: 12.5,
                              color: "rgba(255,255,255,0.7)",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {api_key}
                            </code>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12, flexShrink: 0 }}>
                            {api_key === globalApiKey ? (
                              <span style={{
                                fontSize: 11, fontWeight: 600, color: "#34d399",
                                background: "rgba(52,211,153,0.1)",
                                border: "1px solid rgba(52,211,153,0.2)",
                                padding: "4px 10px", borderRadius: 99,
                              }}>Active</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setGlobalApiKey(api_key);
                                  fetchCredits(api_key);
                                  toast.success("API Key activated!");
                                }}
                                style={{
                                  fontSize: 11, fontWeight: 600, color: "#a78bfa",
                                  background: "rgba(124,106,247,0.08)",
                                  border: "1px solid rgba(124,106,247,0.15)",
                                  padding: "4px 10px", borderRadius: 99,
                                  cursor: "pointer", transition: "all 0.12s",
                                }}
                              >
                                Activate
                              </button>
                            )}

                            <button
                              onClick={() => copyToClipboard(api_key)}
                              style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: copiedKey === api_key ? "#34d399" : "#6b7280",
                                cursor: "pointer", transition: "all 0.12s",
                              }}
                            >
                              {copiedKey === api_key ? <Check size={13} /> : <Copy size={13} />}
                            </button>

                            <button
                              onClick={() => deleteApiKey(api_key)}
                              style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: "rgba(239,68,68,0.06)",
                                border: "1px solid rgba(239,68,68,0.12)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#ef4444", cursor: "pointer",
                                transition: "all 0.12s",
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                        background: "rgba(255,255,255,0.04)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Key size={24} color="#374151" />
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>No API Keys</h4>
                      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
                        Create your first API key to start using ZkAGI services
                      </p>
                      <button
                        onClick={createApiKey}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 8,
                          padding: "10px 20px", borderRadius: 10,
                          background: "linear-gradient(135deg, #7c6af7, #4338ca)",
                          border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                          cursor: "pointer", boxShadow: "0 4px 16px rgba(124,106,247,0.3)",
                        }}
                      >
                        <Plus size={16} />
                        Create API Key
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          }}>
            <div style={{
              background: "#0d1120", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "28px", width: "100%", maxWidth: 400,
              margin: "0 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne', sans-serif" }}>Buy Credits</h2>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#6b7280", cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Amount (USD)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={purchaseAmount}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setPurchaseAmount(val);
                    }
                  }}
                  placeholder="Enter amount..."
                  autoFocus
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e2e8f0", fontSize: 14,
                    fontFamily: "'DM Mono', monospace",
                    outline: "none",
                  }}
                />
                <p style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>
                  1 USD = 1 Credit. Credits are used for AI generations and API calls.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  style={{
                    flex: 1, padding: "11px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#6b7280", fontSize: 13, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBuy}
                  disabled={!purchaseAmount.trim()}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "11px", borderRadius: 10,
                    background: purchaseAmount.trim() ? "linear-gradient(135deg, #7c6af7, #4338ca)" : "rgba(255,255,255,0.04)",
                    border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: purchaseAmount.trim() ? "pointer" : "not-allowed",
                    opacity: purchaseAmount.trim() ? 1 : 0.5,
                  }}
                >
                  <Zap size={14} />
                  Purchase ${purchaseAmount || "0"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Widget Modal */}
        {widgetUrl && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          }}>
            <div style={{ position: "relative", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
              <button
                onClick={() => setWidgetUrl(null)}
                style={{
                  position: "absolute", top: 10, right: 10, zIndex: 10,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#f3f4f6", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#374151", cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
              <iframe
                src={widgetUrl}
                width="410"
                height="696"
                frameBorder="0"
                scrolling="no"
                style={{ display: "block" }}
                title="Payment"
              >
                Can&apos;t load widget
              </iframe>
            </div>
          </div>
        )}

        {/* Animations */}
        <style jsx global>{`
          @keyframes blink {
            0%, 50%, 100% { opacity: 1; }
            25% { opacity: 0.3; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
}
