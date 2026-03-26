'use client';
import React, { useState, useEffect, useRef, FC, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Zap, Image as ImageIcon, Lock, BarChart2, Plus, ChevronDown, ChevronRight,
  LayoutGrid, Store, Users, Key, Send, Paperclip, Terminal,
  Activity, Globe, AlertTriangle, RefreshCw, ArrowUpRight,
  Cpu, Shield, Sparkles, Command, Layers, CircleDot,
  TrendingUp, Wallet, Bot, Settings, LogOut, Search, Menu, X,
  User, Loader2, HelpCircle, Video, Eye, Clock
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useParams } from 'next/navigation';
import { useModelStore } from '@/stores/useModel-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useAgentCart } from '@/stores/agent-cart-store';
import { CustomWalletButton } from '@/component/ui/CustomWalletButton';

const CARDS = [
  {
    num: "01", icon: Bot, color: "#a78bfa", bg: "rgba(167,139,250,0.1)",
    title: "Create Agent Swarm",
    desc: "Deploy autonomous AGI swarms to run and scale your business with zero human intervention.",
    tag: "Popular",
    command: "create-swarm"
  },
  {
    num: "02", icon: Video, color: "#a78bfa", bg: "rgba(167,139,250,0.1)",
    title: "Video Agent",
    desc: "Generate AI-powered videos — set topic, tone & style, then let the agent create.",
    tag: "New",
    command: "video-agent"
  },
  {
    num: "03", icon: Lock, color: "#60a5fa", bg: "rgba(96,165,250,0.1)",
    title: "Create Privacy",
    desc: "Upload files privately, generate zk-proof JSON automatically with /generate-private.",
    tag: "ZkAGI",
    command: "generate-private"
  },
  {
    num: "04", icon: Shield, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",
    title: "Verify Privacy",
    desc: "Use /privacy-ai to upload a zk-proof and query its contents with AI assistance.",
    tag: null,
    command: "privacy-ai"
  },
];

interface NavItem {
  icon: typeof LayoutGrid;
  label: string;
  active?: boolean;
  badge?: string;
  href?: string;
}

const NAV: NavItem[] = [
  { icon: LayoutGrid, label: "ZkTerminal", active: true, href: "/home" },
  { icon: Key, label: "API Keys", href: "/api-key" },
];

const CHIP_COMMANDS = [
  { cmd: "/swarm", icon: Users, color: "#a78bfa" },
  { cmd: "/image-gen", icon: ImageIcon, color: "#34d399" },
  { cmd: "/zk-prove", icon: Shield, color: "#60a5fa" },
  { cmd: "/analyze", icon: Activity, color: "#f59e0b" },
  { cmd: "/mint", icon: Sparkles, color: "#f472b6" },
  { cmd: "/video-gen", icon: Video, color: "#f472b6" },
  { cmd: "/api", icon: Key, color: "#60a5fa" },
];

const CMD_PALETTE = [
  { cmd: "/image-gen", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", desc: "Image generation with or without ticker — mint as NFT", icon: ImageIcon },
  { cmd: "/create-swarm", color: "#34d399", bg: "rgba(52,211,153,0.12)", desc: "Open Swarm builder — create your autonomous org", icon: Users },
  { cmd: "/api", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", desc: "Generate your Zynapse API key", icon: Key },
  { cmd: "/medical-proof-create", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", desc: "Create private medical knowledge base with ZK proofs", icon: Activity },
  { cmd: "/medical-proof-verify", color: "#34d399", bg: "rgba(52,211,153,0.12)", desc: "Verify a medical ZK proof using KB ID and proof ID", icon: Shield },
  { cmd: "/video-gen", color: "#f472b6", bg: "rgba(244,114,182,0.12)", desc: "Enter a prompt to generate a video", icon: Video },
  { cmd: "/generate-private", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", desc: "Upload PDF/DOC/TXT — generate zk-proof JSON", icon: Lock },
  { cmd: "/privacy-ai", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", desc: "Upload a zk-proof + ask a question about its contents", icon: Eye },
];

interface Message {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
  type?: 'text' | 'image' | 'command';
  command?: string;
}

interface HourlyEntry {
  time: string;
  signal: 'LONG' | 'SHORT' | 'HOLD';
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  forecast_price: number;
  current_price: number;
  deviation_percent: number;
  accuracy_percent: number;
  risk_reward_ratio: number;
  sentiment_score: number;
  confidence_50: [number, number];
  confidence_80: [number, number];
  confidence_90: [number, number];
}

interface PastPredictionDay {
  fetched_date: string;
  crypto_news: Array<{ news_id: string; title: string; link: string; analysis: string; description?: string }>;
  macro_news: Array<{ news_id: string; title: string; link: string; analysis: string; description?: string }>;
  hourlyForecast?: {
    BTC: HourlyEntry[];
    ETH: HourlyEntry[];
    SOL: HourlyEntry[];
  };
}

interface ZkTerminalProps {
  onSendMessage?: (message: string, command?: string) => void;
  onCardClick?: (command: string) => void;
  onOpenReport?: () => void;
  onViewPastReport?: (day: PastPredictionDay) => void;
  isLoading?: boolean;
  messages?: Message[];
  pastPredictionsError?: string | null;
  onRetryPastPredictions?: () => void;
}

const ZkTerminal: FC<ZkTerminalProps> = ({
  onSendMessage,
  onCardClick,
  onOpenReport,
  onViewPastReport,
  isLoading = false,
  messages = [],
  pastPredictionsError = null,
  onRetryPastPredictions,
}) => {
  const params = useParams();
  const lang = params.lang as string || 'en';
  const router = useRouter();
  const { connected, publicKey } = useWallet();

  const { selectedModel, credits, setSelectedModel } = useModelStore();
  const { isSubscribed } = useSubscriptionStore();
  const { setFlowGateOpen } = useAgentCart();

  const [inputVal, setInputVal] = useState("");
  const [activeCmd, setActiveCmd] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("ZkTerminal");
  const [inputFocused, setInputFocused] = useState(false);
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [cmdFilter, setCmdFilter] = useState("");
  const [showPlugins, setShowPlugins] = useState(false);
  const [pluginStatus, setPluginStatus] = useState(false);
  const [pluginMemory, setPluginMemory] = useState(true);
  const [litChip, setLitChip] = useState<string | null>(null);

  // Past predictions data
  const [pastPredictions, setPastPredictions] = useState<PastPredictionDay[]>([]);
  const [pastPredictionsLoading, setPastPredictionsLoading] = useState(false);

  useEffect(() => {
    const fetchPastPredictions = async () => {
      try {
        setPastPredictionsLoading(true);
        const res = await fetch("/api/past-prediction", { method: "GET", cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();

        // Collect ALL unique dates from both news AND forecast data
        const allDatesSet = new Set<string>();
        const newsByDate = new Map<string, PastPredictionDay>();

        // Add dates from past_news_last_30_days
        const days = data.past_news_last_30_days;
        if (Array.isArray(days)) {
          days.forEach((d: PastPredictionDay) => {
            if (d?.fetched_date) {
              allDatesSet.add(d.fetched_date);
              newsByDate.set(d.fetched_date, d);
            }
          });
        }

        // Add dates from forecast_hourly_last_30_days (extract date from time strings)
        const forecast = data.forecast_hourly_last_30_days;
        if (forecast) {
          const addForecastDates = (entries: Array<{ time?: string }> | undefined) => {
            entries?.forEach(entry => {
              if (entry.time) {
                const dateStr = entry.time.split('T')[0];
                if (dateStr) allDatesSet.add(dateStr);
              }
            });
          };
          addForecastDates(forecast.BTC);
          addForecastDates(forecast.ETH);
          addForecastDates(forecast.SOL);
        }

        // Build merged entries for ALL dates, including hourly forecast per day
        const merged: PastPredictionDay[] = Array.from(allDatesSet).map(date => {
          const existing = newsByDate.get(date);
          const base = existing || { fetched_date: date, crypto_news: [], macro_news: [] };

          // Filter hourly forecast entries for this specific date
          let hourlyForecastForDate: { BTC: HourlyEntry[]; ETH: HourlyEntry[]; SOL: HourlyEntry[] } | undefined;
          if (forecast) {
            hourlyForecastForDate = {
              BTC: forecast.BTC?.filter((entry: HourlyEntry) => entry.time?.startsWith(date)) || [],
              ETH: forecast.ETH?.filter((entry: HourlyEntry) => entry.time?.startsWith(date)) || [],
              SOL: forecast.SOL?.filter((entry: HourlyEntry) => entry.time?.startsWith(date)) || [],
            };
          }

          return { ...base, hourlyForecast: hourlyForecastForDate };
        });

        // Sort by date descending (most recent first)
        const sorted = merged.sort((a, b) =>
          new Date(b.fetched_date).getTime() - new Date(a.fetched_date).getTime()
        );
        setPastPredictions(sorted);
      } catch (err) {
        console.error("Failed to fetch past predictions:", err);
      } finally {
        setPastPredictionsLoading(false);
      }
    };
    fetchPastPredictions();
  }, []);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    onSendMessage?.(inputVal, activeCmd || undefined);
    setInputVal("");
    setActiveCmd(null);
    setShowCmdPalette(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowCmdPalette(false);
      setShowPlugins(false);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);
    // Only show command palette while typing the command itself (before any space)
    if (val.startsWith('/') && !val.includes(' ')) {
      setShowCmdPalette(true);
      setCmdFilter(val.slice(1));
    } else {
      setShowCmdPalette(false);
      setCmdFilter("");
    }
  };

  const handleCmdPick = (cmd: string) => {
    setInputVal(cmd + ' ');
    setShowCmdPalette(false);
    highlightChip(cmd);
    inputRef.current?.focus();
  };

  const highlightChip = (cmd: string) => {
    setLitChip(cmd);
    setTimeout(() => setLitChip(null), 2000);
  };

  const handleChipClick = (cmd: string) => {
    setInputVal(cmd + ' ');
    highlightChip(cmd);
    inputRef.current?.focus();
  };

  const handleCardClick = (command: string) => {
    if (command === 'create-swarm') {
      setFlowGateOpen(true);
    } else if (command === 'video-agent') {
      onCardClick?.(command);
    } else {
      onCardClick?.(command);
      setInputVal(`/${command} `);
      inputRef.current?.focus();
    }
  };

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.label);
    if (item.href) {
      router.push(`/${lang}${item.href}`);
    }
    if (isMobile) setSidebarOpen(false);
  };

  const filteredCmds = CMD_PALETTE.filter(c =>
    c.cmd.includes(cmdFilter.toLowerCase()) || c.desc.toLowerCase().includes(cmdFilter.toLowerCase())
  );

  // Close palette/plugins on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showCmdPalette && !target.closest('.cmd-pal') && !target.closest('.input-ta')) {
        setShowCmdPalette(false);
      }
      if (showPlugins && !target.closest('.plug-modal') && !target.closest('.plug-btn')) {
        setShowPlugins(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showCmdPalette, showPlugins]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .zk-shell *, .zk-shell *::before, .zk-shell *::after { box-sizing: border-box; margin:0; padding:0; }
        .zk-shell::-webkit-scrollbar { width: 3px; }
        .zk-shell::-webkit-scrollbar-track { background: transparent; }
        .zk-shell::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 9px; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(124,106,247,.4)} 70%{box-shadow:0 0 0 8px transparent} }
        @keyframes glow { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
        @keyframes typingDot { 0%,60%,100%{opacity:.25;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
        @keyframes progressPulse { 0%{width:5%} 50%{width:65%} 90%{width:85%} 100%{width:90%} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(124,106,247,0.15)} 50%{border-color:rgba(124,106,247,0.4)} }

        .zk-fade-up { animation: fadeUp 0.4s ease both; }
        .zk-fade-up-1 { animation: fadeUp 0.4s 0.08s ease both; opacity:0; animation-fill-mode:forwards; }
        .zk-fade-up-2 { animation: fadeUp 0.4s 0.15s ease both; opacity:0; animation-fill-mode:forwards; }
        .zk-fade-up-3 { animation: fadeUp 0.4s 0.2s ease both; opacity:0; animation-fill-mode:forwards; }
        .zk-fade-up-4 { animation: fadeUp 0.4s 0.28s ease both; opacity:0; animation-fill-mode:forwards; }

        .zk-chips-row::-webkit-scrollbar { display: none; }
        .zk-chips-row { scrollbar-width: none; }
      `}</style>

      <div className="zk-shell" style={{
        display: "flex", height: "100vh", overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        background: "#07090f", color: "#e2e8f0",
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
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }}
            onClick={() => setSidebarOpen(false)}
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

          <button style={{
            padding: "7px 12px", margin: "9px 9px 3px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8, cursor: "pointer",
            color: "#6b7280", fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            width: "calc(100% - 18px)",
            transition: "all 0.15s",
          }}>
            <Plus size={13} />
            New session
          </button>

          <div style={{
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#374151", padding: "10px 14px 4px",
          }}>Navigation</div>

          {NAV.map((item) => (
            <div
              key={item.label}
              onClick={() => handleNavClick(item)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "7px 12px", margin: "1px 6px",
                borderRadius: 8, cursor: "pointer",
                color: activeNav === item.label ? "#a78bfa" : "#6b7280",
                background: activeNav === item.label ? "rgba(167,139,250,0.08)" : "transparent",
                fontSize: 13, fontWeight: activeNav === item.label ? 600 : 400,
                transition: "all 0.12s",
                position: "relative",
              }}
            >
              {activeNav === item.label && (
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
              {item.badge && (
                <span style={{
                  marginLeft: "auto", background: "rgba(167,139,250,0.12)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  color: "#a78bfa", fontSize: 10, fontWeight: 700,
                  padding: "2px 7px", borderRadius: 99,
                }}>{item.badge}</span>
              )}
            </div>
          ))}

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px 4px",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#374151",
            }}>Agent Swarms</span>
            <ChevronDown size={11} color="#374151" />
          </div>
          <div style={{ padding: "3px 14px 8px", fontSize: 12, color: "#374151", fontStyle: "italic" }}>
            No agents created yet
          </div>

          <div style={{ flex: 1 }} />

          {/* Help Card */}
          <a
            href="https://app.gitbook.com/o/rmFFGxpNLUTqMbbTMW3k/s/cD3hqS7a0U5cMxQQhMo6/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div style={{
              margin: "0 8px 8px", padding: "9px 11px",
              background: "rgba(52,211,153,0.05)",
              border: "1px solid rgba(52,211,153,0.12)",
              borderRadius: 10,
              display: "flex", alignItems: "center", gap: 9,
              cursor: "pointer",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: "rgba(52,211,153,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
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
                {credits?.toFixed(2) || "0.00"}
              </div>
              <div style={{ fontSize: 11, color: "#374151", marginTop: 1 }}>
                ~{Math.floor((credits || 0) * 5)} generations remaining
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 99, marginTop: 9, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${Math.min((credits || 0) / 20 * 100, 100)}%`,
                  background: "linear-gradient(90deg, #34d399, #059669)",
                  borderRadius: 99,
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: "shimmer 2s infinite",
                  }} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{
          flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
          background: "#07090f", position: "relative",
          marginTop: isMobile ? 56 : 0,
        }}>
          {/* Glows */}
          <div style={{
            position: "absolute", width: 500, height: 500,
            background: "radial-gradient(circle, #7c6af7, transparent 70%)",
            opacity: 0.055, top: -80, left: "26%",
            pointerEvents: "none", borderRadius: "50%", zIndex: 0,
          }} />
          <div style={{
            position: "absolute", width: 320, height: 320,
            background: "radial-gradient(circle, #4338ca, transparent 70%)",
            opacity: 0.04, bottom: 30, right: "14%",
            pointerEvents: "none", borderRadius: "50%", zIndex: 0,
          }} />

          {/* TOPBAR */}
          {!isMobile && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 22px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(7,9,15,0.9)",
              backdropFilter: "blur(14px)",
              zIndex: 20, flexShrink: 0,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "rgba(52,211,153,0.06)",
                border: "1px solid rgba(52,211,153,0.15)",
                padding: "5px 13px", borderRadius: 99,
                fontSize: 11.5, fontWeight: 500, color: "#34d399",
                fontFamily: "'DM Mono', monospace", letterSpacing: "0.03em",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 6px #34d399",
                  animation: "blink 1.4s infinite",
                  flexShrink: 0,
                }} />
                Zero Employee Enterprise
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 8, padding: "6px 12px",
                  fontSize: 13, fontWeight: 500, color: "#e2e8f0",
                  cursor: "pointer",
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 5px #a78bfa" }} />
                  <Cpu size={12} color="#a78bfa" />
                  {selectedModel || "DeepSeek"}
                  <ChevronDown size={11} color="#6b7280" />
                </div>
                <CustomWalletButton />
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div style={{
            flex: 1, overflow: hasMessages ? "auto" : "hidden",
            display: "flex",
            alignItems: hasMessages ? "flex-start" : "center",
            justifyContent: "center",
            position: "relative", zIndex: 1,
            padding: hasMessages ? 0 : "0 24px",
          }}>

            {!hasMessages ? (
              <div style={{
                width: "100%", maxWidth: 720,
                display: "flex", flexDirection: "column", gap: 0,
              }}>
                {/* HERO */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", textAlign: "center",
                  padding: "0 0 20px",
                }}>
                  <div className="zk-fade-up" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    padding: "5px 14px", borderRadius: 99,
                    fontSize: 11, fontWeight: 500, color: "#6b7280",
                    marginBottom: 14, letterSpacing: "0.03em",
                  }}>
                    <Sparkles size={11} color="#a78bfa" />
                    Privacy-Preserving AI · Powered by ZK Proofs
                  </div>

                  <h1 className="zk-fade-up-1" style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: isMobile ? "clamp(24px,8vw,32px)" : "clamp(26px,3vw,40px)",
                    fontWeight: 800, lineHeight: 1.08,
                    color: "#f8fafc", letterSpacing: "-1.5px",
                    marginBottom: 8,
                  }}>
                    What would you like<br />
                    to <span style={{
                      background: "linear-gradient(135deg, #a78bfa, #c084fc, #818cf8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>create?</span>
                  </h1>

                  <p className="zk-fade-up-2" style={{
                    fontSize: 12.5, color: "#6b7280", maxWidth: 380,
                    lineHeight: 1.65,
                  }}>
                    Deploy autonomous AI agent swarms, generate on-chain assets,<br />
                    or explore privacy-preserving infrastructure.
                  </p>
                </div>

                {/* INPUT SECTION */}
                <div className="zk-fade-up-3" style={{
                  width: "100%", paddingBottom: 18,
                }}>
                  <div ref={inputWrapRef} style={{ width: "100%", position: "relative" }}>
                    {/* Command Palette */}
                    {showCmdPalette && (
                      <div className="cmd-pal" style={{
                        position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
                        background: "#0d1122",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 16, zIndex: 200,
                        boxShadow: "0 8px 60px rgba(0,0,0,0.85)",
                        animation: "slideUp 0.15s ease",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "12px 16px",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                          <Search size={14} color="#a78bfa" />
                          <input
                            style={{
                              flex: 1, background: "transparent", border: "none", outline: "none",
                              color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                            }}
                            placeholder="Search commands..."
                            value={cmdFilter}
                            onChange={e => { setCmdFilter(e.target.value); }}
                            autoFocus
                          />
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 4, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6b7280" }}>esc</span>
                          </div>
                        </div>
                        <div style={{
                          display: "grid", gridTemplateColumns: "1fr 1fr",
                          gap: 5, padding: 8, maxHeight: 300, overflowY: "auto",
                        }}>
                          {filteredCmds.map(c => {
                            const Icon = c.icon;
                            return (
                              <div
                                key={c.cmd}
                                onClick={() => handleCmdPick(c.cmd)}
                                style={{
                                  padding: "11px 13px", borderRadius: 11,
                                  border: "1px solid rgba(255,255,255,0.06)",
                                  cursor: "pointer",
                                  background: "rgba(255,255,255,0.02)",
                                  transition: "all 0.15s",
                                  display: "flex", alignItems: "flex-start", gap: 11,
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.07)";
                                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.25)";
                                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                                  (e.currentTarget as HTMLElement).style.transform = "none";
                                }}
                              >
                                <div style={{
                                  width: 32, height: 32, borderRadius: 9,
                                  background: c.bg,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  flexShrink: 0, marginTop: 1,
                                }}>
                                  <Icon size={14} color={c.color} />
                                </div>
                                <div>
                                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, fontWeight: 500, color: c.color, marginBottom: 3 }}>{c.cmd}</div>
                                  <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.45 }}>{c.desc}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{
                          padding: "8px 12px",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          <span style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 4, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6b7280" }}>&#8629;</span> select
                          </span>
                          <span style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 4, marginLeft: 10 }}>
                            <span style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 4, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6b7280" }}>esc</span> close
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Plugins Modal - Full Overlay (portaled to body) */}
                    {showPlugins && typeof document !== 'undefined' && createPortal(
                      <div
                        className="plug-modal"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowPlugins(false); }}
                        style={{
                          position: "fixed", inset: 0, zIndex: 9999,
                          background: "rgba(0,0,0,0.6)",
                          backdropFilter: "blur(6px)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          animation: "fadeIn 0.15s ease",
                        }}
                      >
                        <div style={{
                          width: 420, maxWidth: "90vw", maxHeight: "80vh",
                          background: "linear-gradient(145deg, #0f1629, #0a0f1e)",
                          border: "1px solid rgba(124,106,247,0.18)",
                          borderRadius: 20,
                          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(124,106,247,0.08)",
                          overflow: "hidden",
                          display: "flex", flexDirection: "column",
                        }}>
                          {/* Header */}
                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "18px 22px",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(124,106,247,0.04)",
                          }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 9 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: "rgba(167,139,250,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <Zap size={14} color="#a78bfa" />
                              </div>
                              Plugins
                              <span style={{
                                fontSize: 10, padding: "2px 8px", borderRadius: 99,
                                background: "rgba(52,211,153,0.1)", color: "#34d399",
                                border: "1px solid rgba(52,211,153,0.2)", fontWeight: 600,
                              }}>2 Available</span>
                            </div>
                            <button onClick={() => setShowPlugins(false)} style={{
                              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                              cursor: "pointer", color: "#6b7280", padding: 6, borderRadius: 8,
                              transition: "all 0.15s",
                            }}>
                              <X size={15} />
                            </button>
                          </div>

                          {/* Plugin List */}
                          <div style={{ padding: "16px 22px", overflowY: "auto", flex: 1 }}>
                            {/* Web3 AI Assistant Plugin */}
                            <div style={{
                              padding: "16px 18px", borderRadius: 14,
                              background: "rgba(255,255,255,0.025)",
                              border: pluginStatus ? "1px solid rgba(124,106,247,0.3)" : "1px solid rgba(255,255,255,0.06)",
                              marginBottom: 14,
                              transition: "all 0.2s",
                            }}>
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: "linear-gradient(135deg, rgba(124,106,247,0.2), rgba(167,139,250,0.1))",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: "1px solid rgba(124,106,247,0.2)",
                                  }}>
                                    <Globe size={18} color="#a78bfa" />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Web3 AI Assistant</div>
                                    <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>Powered by ChainGPT</div>
                                  </div>
                                </div>
                                <div
                                  onClick={() => setPluginStatus(!pluginStatus)}
                                  style={{
                                    width: 42, height: 22, borderRadius: 99,
                                    border: `1px solid ${pluginStatus ? "#7c6af7" : "rgba(255,255,255,0.1)"}`,
                                    cursor: "pointer", position: "relative",
                                    transition: "all 0.25s", flexShrink: 0,
                                    background: pluginStatus ? "linear-gradient(135deg, #7c6af7, #a78bfa)" : "rgba(255,255,255,0.06)",
                                  }}
                                >
                                  <div style={{
                                    position: "absolute", top: 2, left: pluginStatus ? 22 : 2,
                                    width: 16, height: 16, borderRadius: "50%",
                                    background: "#fff", transition: "left 0.25s",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                  }} />
                                </div>
                              </div>

                              <div style={{ fontSize: 12.5, color: "#8892a8", lineHeight: 1.6, marginBottom: 14 }}>
                                Crypto, DeFi, NFTs, and blockchain analysis with real-time Web3 intelligence.
                              </div>

                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <Shield size={12} color="#6b7280" />
                                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Memory</span>
                                </div>
                                <div
                                  onClick={() => setPluginMemory(!pluginMemory)}
                                  style={{
                                    width: 42, height: 22, borderRadius: 99,
                                    border: `1px solid ${pluginMemory ? "#7c6af7" : "rgba(255,255,255,0.1)"}`,
                                    cursor: "pointer", position: "relative",
                                    transition: "all 0.25s", flexShrink: 0,
                                    background: pluginMemory ? "linear-gradient(135deg, #7c6af7, #a78bfa)" : "rgba(255,255,255,0.06)",
                                  }}
                                >
                                  <div style={{
                                    position: "absolute", top: 2, left: pluginMemory ? 22 : 2,
                                    width: 16, height: 16, borderRadius: "50%",
                                    background: "#fff", transition: "left 0.25s",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                  }} />
                                </div>
                              </div>

                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {["DeFi", "Trading", "NFTs", "Blockchain", "Crypto News"].map(t => (
                                  <span key={t} style={{
                                    fontSize: 11, padding: "3px 10px", borderRadius: 99,
                                    background: "rgba(167,139,250,0.08)",
                                    border: "1px solid rgba(167,139,250,0.15)",
                                    color: "#a78bfa", fontWeight: 500,
                                  }}>{t}</span>
                                ))}
                              </div>
                            </div>

                            {/* AI Art Generator Plugin */}
                            <div style={{
                              padding: "16px 18px", borderRadius: 14,
                              background: "rgba(255,255,255,0.015)",
                              border: "1px solid rgba(255,255,255,0.04)",
                              opacity: 0.6,
                            }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(96,165,250,0.1))",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: "1px solid rgba(52,211,153,0.15)",
                                  }}>
                                    <ImageIcon size={18} color="#34d399" />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>AI Art Generator</div>
                                    <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>Generate on-chain visual assets</div>
                                  </div>
                                </div>
                                <span style={{
                                  fontSize: 10, padding: "3px 10px", borderRadius: 99,
                                  background: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                  color: "#4b5563", fontWeight: 600,
                                }}>Coming Soon</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>,
                      document.body
                    )}

                    {/* INPUT BOX */}
                    <div style={{
                      background: "rgba(255,255,255,0.035)",
                      border: inputFocused ? "1px solid rgba(124,106,247,0.45)" : "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 16, overflow: "hidden",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxShadow: inputFocused ? "0 0 0 3px rgba(124,106,247,0.07)" : "none",
                    }}>
                      <textarea
                        ref={inputRef}
                        className="input-ta"
                        style={{
                          width: "100%", background: "transparent",
                          border: "none", outline: "none",
                          padding: "13px 16px 9px",
                          color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14, resize: "none", lineHeight: 1.5,
                          display: "block", height: 52,
                        }}
                        placeholder="Message ZkTerminal or type / to invoke command palette"
                        value={inputVal}
                        onChange={e => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                      />

                      {/* Command Chips */}
                      <div className="zk-chips-row" style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "8px 12px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        overflowX: "auto",
                      }}>
                        {CHIP_COMMANDS.map(chip => {
                          const Icon = chip.icon;
                          const isLit = litChip === chip.cmd;
                          return (
                            <div
                              key={chip.cmd}
                              onClick={() => handleChipClick(chip.cmd)}
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "4px 11px", borderRadius: 8,
                                border: isLit ? "1px solid rgba(167,139,250,0.28)" : "1px solid rgba(255,255,255,0.06)",
                                background: isLit ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.025)",
                                color: isLit ? "#a78bfa" : "#6b7280",
                                fontSize: 12, fontFamily: "'DM Mono', monospace",
                                cursor: "pointer", whiteSpace: "nowrap",
                                transition: "all 0.15s", flexShrink: 0,
                              }}
                            >
                              <Icon size={11} color={chip.color} />
                              {chip.cmd}
                            </div>
                          );
                        })}
                      </div>

                      {/* Input Footer */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 12px 10px",
                      }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 5,
                          fontSize: 12.5, color: "#34d399",
                          fontFamily: "'DM Mono', monospace", fontWeight: 600,
                          padding: "4px 10px",
                          background: "rgba(52,211,153,0.07)",
                          border: "1px solid rgba(52,211,153,0.15)",
                          borderRadius: 8,
                        }}>
                          <Activity size={11} />
                          {credits?.toFixed(2) || "0.00"}
                        </div>
                        <button style={{
                          background: "none", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center",
                          color: "#374151", padding: 3, borderRadius: 5,
                        }}>
                          <Paperclip size={15} />
                        </button>
                        <button
                          className="plug-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPlugins(!showPlugins);
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "4px 11px",
                            background: showPlugins ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.03)",
                            border: showPlugins ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 8, cursor: "pointer",
                            color: showPlugins ? "#a78bfa" : "#6b7280",
                            fontSize: 13, fontWeight: 500,
                            fontFamily: "'DM Sans', sans-serif",
                            transition: "all 0.15s",
                          }}
                        >
                          <Zap size={12} />
                          Plugins
                        </button>
                        <button
                          onClick={handleSend}
                          disabled={isLoading}
                          style={{
                            marginLeft: "auto",
                            width: 34, height: 34,
                            background: isLoading ? "rgba(124,106,247,0.5)" : "linear-gradient(135deg, #7c6af7, #4338ca)",
                            border: "none", borderRadius: 9,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: isLoading ? "not-allowed" : "pointer", color: "#fff",
                            boxShadow: "0 0 14px rgba(124,106,247,0.35)",
                            transition: "all 0.15s", flexShrink: 0,
                          }}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARDS SECTION */}
                <div className="zk-fade-up-4" style={{ width: "100%" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    marginBottom: 10,
                  }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "#374151",
                    }}>Quick Start</div>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                    <div style={{ fontSize: 11, color: "#374151" }}>or type a command above &#8593;</div>
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 9, width: "100%",
                  }}>
                    {CARDS.map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div
                          key={card.num}
                          onClick={() => handleCardClick(card.command)}
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: hoveredCard === i ? "1px solid rgba(167,139,250,0.28)" : "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 13, padding: "16px 18px",
                            cursor: "pointer", textAlign: "left",
                            display: "flex", flexDirection: "column", gap: 10,
                            transition: "all 0.2s",
                            transform: hoveredCard === i ? "translateY(-2px)" : "none",
                            boxShadow: hoveredCard === i ? "0 14px 44px rgba(0,0,0,0.4)" : "none",
                            position: "relative", overflow: "hidden",
                          }}
                          onMouseEnter={() => setHoveredCard(i)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          {/* Hover bg */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: `linear-gradient(135deg, ${card.bg} 0%, transparent 60%)`,
                            opacity: hoveredCard === i ? 1 : 0,
                            transition: "opacity 0.2s",
                            pointerEvents: "none", borderRadius: "inherit",
                          }} />

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                            <span style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: 10, color: "#374151", letterSpacing: "0.05em",
                            }}>{card.num}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {card.tag && (
                                <span style={{
                                  fontSize: 9, fontWeight: 700,
                                  letterSpacing: "0.07em", textTransform: "uppercase",
                                  color: card.num === "03" ? "#a78bfa" : card.color,
                                  padding: "2px 7px",
                                  background: card.num === "03" ? "rgba(167,139,250,0.1)" : card.bg,
                                  borderRadius: 99,
                                  border: card.num === "03" ? "1px solid rgba(167,139,250,0.2)" : `1px solid ${card.color}22`,
                                }}>{card.tag}</span>
                              )}
                              <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: card.bg,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <Icon size={14} color={card.color} />
                              </div>
                            </div>
                          </div>

                          <div style={{ position: "relative" }}>
                            <div style={{
                              fontSize: 14, fontWeight: 700, color: "#f1f5f9",
                              letterSpacing: "-0.2px",
                              fontFamily: "'Syne', sans-serif",
                              marginBottom: 3,
                            }}>
                              {card.title}
                            </div>
                            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.65, flex: 1 }}>
                              {card.desc}
                            </div>
                          </div>

                          <div style={{
                            width: 22, height: 22, borderRadius: 6,
                            background: hoveredCard === i ? card.bg : "rgba(255,255,255,0.03)",
                            border: `1px solid ${hoveredCard === i ? card.color + "44" : "rgba(255,255,255,0.06)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                            alignSelf: "flex-end",
                            position: "relative",
                          }}>
                            <ArrowUpRight size={11} color={hoveredCard === i ? card.color : "#374151"} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* CHAT MESSAGES VIEW */
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                width: "100%",
              }}>
                <div style={{
                  flex: 1, padding: isMobile ? "16px 12px" : "24px 32px",
                  maxWidth: 780, width: "100%", margin: "0 auto",
                }}>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className="zk-fade-up"
                      style={{
                        display: "flex",
                        gap: isMobile ? 10 : 14,
                        marginBottom: 20,
                        flexDirection: msg.role === 'user' ? "row-reverse" : "row",
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: msg.role === 'user'
                          ? "rgba(167,139,250,0.15)"
                          : "linear-gradient(135deg, rgba(124,106,247,0.2), rgba(79,70,229,0.2))",
                        border: msg.role === 'user'
                          ? "1px solid rgba(167,139,250,0.3)"
                          : "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {msg.role === 'user'
                          ? <User size={14} color="#a78bfa" />
                          : <Terminal size={14} color="#818cf8" />
                        }
                      </div>
                      <div style={{
                        maxWidth: isMobile ? "85%" : "75%",
                        textAlign: msg.role === 'user' ? "right" : "left",
                      }}>
                        <div style={{
                          fontSize: 11, fontWeight: 600,
                          color: msg.role === 'user' ? "#a78bfa" : "#818cf8",
                          marginBottom: 6,
                          fontFamily: "'DM Mono', monospace",
                        }}>
                          {msg.role === 'user' ? 'You' : 'ZkTerminal'}
                        </div>
                        <div style={{
                          background: msg.role === 'user'
                            ? "rgba(167,139,250,0.1)"
                            : "rgba(255,255,255,0.03)",
                          border: msg.role === 'user'
                            ? "1px solid rgba(167,139,250,0.2)"
                            : "1px solid rgba(255,255,255,0.06)",
                          borderRadius: msg.role === 'user' ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          padding: "12px 16px",
                          fontSize: 14, lineHeight: 1.7, color: "#e2e8f0",
                          wordBreak: "break-word",
                        }}>
                          {typeof msg.content === 'string' ? (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p style={{ margin: "0 0 8px" }}>{children}</p>,
                                code: ({ children }) => (
                                  <code style={{
                                    background: "rgba(255,255,255,0.06)",
                                    padding: "2px 6px", borderRadius: 4,
                                    fontFamily: "'DM Mono', monospace", fontSize: 13,
                                  }}>{children}</code>
                                ),
                              }}
                            >{msg.content}</ReactMarkdown>
                          ) : msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Processing Indicator */}
                  {isLoading && (
                    <div className="zk-fade-up" style={{
                      display: "flex", gap: isMobile ? 10 : 14, marginBottom: 20,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: "linear-gradient(135deg, rgba(124,106,247,0.2), rgba(79,70,229,0.2))",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        animation: "borderGlow 2s ease-in-out infinite",
                      }}>
                        <Terminal size={14} color="#818cf8" />
                      </div>
                      <div style={{ flex: 1, maxWidth: isMobile ? "85%" : "75%" }}>
                        <div style={{
                          fontSize: 11, fontWeight: 600, color: "#818cf8",
                          marginBottom: 6, fontFamily: "'DM Mono', monospace",
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          ZkTerminal
                          <span style={{
                            fontSize: 9, color: "#34d399", fontWeight: 500,
                            background: "rgba(52,211,153,0.1)",
                            border: "1px solid rgba(52,211,153,0.2)",
                            padding: "1px 6px", borderRadius: 99,
                            display: "inline-flex", alignItems: "center", gap: 4,
                          }}>
                            <span style={{
                              width: 5, height: 5, borderRadius: "50%",
                              background: "#34d399", display: "inline-block",
                              animation: "blink 1.4s infinite",
                            }} />
                            thinking
                          </span>
                        </div>
                        <div style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "14px 14px 14px 4px",
                          padding: "16px 18px",
                          animation: "borderGlow 2s ease-in-out infinite",
                        }}>
                          {/* Typing dots */}
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                            {[0, 1, 2].map(i => (
                              <div key={i} style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: "linear-gradient(135deg, #7c6af7, #a78bfa)",
                                animation: `typingDot 1.4s ${i * 0.2}s ease-in-out infinite`,
                              }} />
                            ))}
                          </div>
                          {/* Status text */}
                          <div style={{
                            fontSize: 12.5, color: "#6b7280", lineHeight: 1.6,
                            display: "flex", flexDirection: "column", gap: 6,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Cpu size={13} color="#a78bfa" />
                              <span>Processing with <strong style={{ color: "#a78bfa" }}>{selectedModel || "DeepSeek"}</strong></span>
                            </div>
                            <span style={{ fontSize: 11, color: "#374151" }}>
                              Analyzing your request — this may take a moment...
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div style={{
                            height: 3, background: "rgba(255,255,255,0.04)",
                            borderRadius: 99, marginTop: 12, overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%",
                              background: "linear-gradient(90deg, #7c6af7, #a78bfa, #818cf8)",
                              borderRadius: 99,
                              animation: "progressPulse 8s ease-in-out infinite",
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div style={{
                  padding: isMobile ? "10px 12px 16px" : "14px 24px 22px",
                  flexShrink: 0,
                  background: "linear-gradient(to top, #07090f 60%, transparent)",
                  position: "sticky", bottom: 0,
                }}>
                  <div style={{
                    background: "rgba(255,255,255,0.035)",
                    border: inputFocused ? "1px solid rgba(124,106,247,0.45)" : "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 16, overflow: "hidden",
                    maxWidth: 780, margin: "0 auto",
                    boxShadow: inputFocused ? "0 0 0 3px rgba(124,106,247,0.07)" : "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}>
                    <textarea
                      ref={inputRef}
                      style={{
                        width: "100%", background: "transparent",
                        border: "none", outline: "none",
                        padding: "13px 16px 9px",
                        color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14, resize: "none", lineHeight: 1.5, display: "block",
                        height: 52,
                      }}
                      placeholder="Message ZkTerminal or type / to invoke command palette"
                      value={inputVal}
                      onChange={e => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                    />
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 12px 10px",
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        fontSize: 12.5, color: "#34d399",
                        fontFamily: "'DM Mono', monospace", fontWeight: 600,
                        padding: "4px 10px",
                        background: "rgba(52,211,153,0.07)",
                        border: "1px solid rgba(52,211,153,0.15)",
                        borderRadius: 8,
                      }}>
                        <Activity size={11} />
                        {credits?.toFixed(2) || "0.00"}
                      </div>
                      <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#374151", padding: 3, borderRadius: 5 }}>
                        <Paperclip size={15} />
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={isLoading}
                        style={{
                          marginLeft: "auto",
                          width: 34, height: 34,
                          background: isLoading ? "rgba(124,106,247,0.5)" : "linear-gradient(135deg, #7c6af7, #4338ca)",
                          border: "none", borderRadius: 9,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: isLoading ? "not-allowed" : "pointer", color: "#fff",
                          boxShadow: "0 0 14px rgba(124,106,247,0.35)",
                          transition: "all 0.15s", flexShrink: 0,
                        }}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT PANEL - Desktop Only, hidden in chat mode */}
        {!isMobile && !hasMessages && (
          <aside style={{
            width: 268, flexShrink: 0,
            background: "#0b0d16",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Today's Prediction Report */}
            <div style={{ padding: "13px 15px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#a78bfa", marginBottom: 9,
              }}>
                <TrendingUp size={10} />
                Today&apos;s Report
              </div>
              <div
                onClick={onOpenReport}
                style={{
                  background: "linear-gradient(135deg, rgba(124,106,247,0.08), rgba(67,56,202,0.04))",
                  border: "1px solid rgba(124,106,247,0.18)",
                  borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <div>
                  <p style={{ fontSize: 11.5, color: "#c4b5fd", fontWeight: 600, marginBottom: 2 }}>
                    AI Trading Insights
                  </p>
                  <p style={{ fontSize: 10.5, color: "#6b7280" }}>
                    Trends, signals &amp; forecasts
                  </p>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(167,139,250,0.15)",
                  border: "1px solid rgba(167,139,250,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <ChevronRight size={12} color="#a78bfa" />
                </div>
              </div>
            </div>

            {/* Past Predictions - scrollable */}
            <div style={{
              padding: "13px 15px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", flexDirection: "column",
              flex: 1, minHeight: 0, overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 9, flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#a78bfa",
                }}>
                  <BarChart2 size={10} />
                  Past Predictions
                </div>
                {pastPredictions.length > 0 && (
                  <span style={{
                    fontSize: 10, fontFamily: "'DM Mono', monospace",
                    color: "#4b5563", fontWeight: 500,
                  }}>
                    {pastPredictions.length}d
                  </span>
                )}
              </div>

              {pastPredictionsError ? (
                <div style={{
                  background: "rgba(248,113,113,0.04)",
                  border: "1px solid rgba(248,113,113,0.15)",
                  borderRadius: 10, padding: 14, marginBottom: 13,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <AlertTriangle size={13} color="#f87171" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#f87171" }}>Error loading predictions</span>
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(248,113,113,0.5)", lineHeight: 1.5, marginBottom: 10 }}>
                    {pastPredictionsError}
                  </p>
                  <button
                    onClick={onRetryPastPredictions}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "rgba(248,113,113,0.1)",
                      border: "1px solid rgba(248,113,113,0.2)",
                      color: "#f87171", fontSize: 11, fontWeight: 600,
                      padding: "5px 10px", borderRadius: 7,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <RefreshCw size={10} />
                    Retry
                  </button>
                </div>
              ) : pastPredictionsLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} color="#a78bfa" />
                  <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>Loading...</span>
                </div>
              ) : pastPredictions.length === 0 ? (
                <div style={{ padding: 14, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                  No past predictions available.
                </div>
              ) : (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 8,
                  overflowY: "auto", flex: 1, paddingBottom: 13,
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(167,139,250,0.2) transparent",
                }}>
                  {pastPredictions.map((day) => {
                    const allNews = [...day.crypto_news, ...day.macro_news];
                    const sentimentScores = allNews.map(n => {
                      if (!n.analysis) return null;
                      const jsonBlock = n.analysis.match(/```json\s*([\s\S]*?)```/);
                      if (jsonBlock) {
                        try {
                          const parsed = JSON.parse(jsonBlock[1]);
                          const s = parsed.sentiment_score ?? parsed.sentimentScore ?? parsed.Sentiment_Score;
                          if (typeof s === 'number') return s > 5 ? s / 20 : s;
                        } catch { /* */ }
                      }
                      try {
                        const direct = JSON.parse(n.analysis);
                        if (direct && typeof direct === 'object') {
                          const s = direct.sentiment_score ?? direct.sentimentScore ?? direct.Sentiment_Score;
                          if (typeof s === 'number') return s > 5 ? s / 20 : s;
                        }
                      } catch { /* */ }
                      const inlineMatch = n.analysis.match(/"sentiment_score"\s*:\s*([\d.]+)/);
                      if (inlineMatch) {
                        const v = parseFloat(inlineMatch[1]);
                        if (!isNaN(v)) return v > 5 ? v / 20 : v;
                      }
                      return null;
                    }).filter((s): s is number => typeof s === 'number' && !isNaN(s));

                    let avgSentiment: number | null = sentimentScores.length > 0
                      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
                      : null;

                    // Fallback 1: blend accuracy + deviation + sentiment from hourly forecast
                    if (avgSentiment === null && day.hourlyForecast) {
                      const fc = day.hourlyForecast;
                      const allEntries = [
                        ...(fc.BTC || []), ...(fc.ETH || []), ...(fc.SOL || []),
                      ].filter(e => e && typeof e.accuracy_percent === 'number');
                      if (allEntries.length > 0) {
                        const avgAcc = allEntries.reduce((s, e) => s + (e.accuracy_percent ?? 0), 0) / allEntries.length;
                        const avgDev = allEntries.reduce((s, e) => s + Math.abs(e.deviation_percent ?? 0), 0) / allEntries.length;
                        const avgSent = allEntries.reduce((s, e) => s + (e.sentiment_score ?? 2.5), 0) / allEntries.length;
                        const accComp = (avgAcc / 100) * 5;
                        const devComp = Math.max(0, Math.min(5, 5 - (avgDev / 10)));
                        const sentComp = avgSent > 5 ? avgSent / 20 : avgSent;
                        avgSentiment = Math.max(0, Math.min(5, Math.round((accComp * 0.4 + devComp * 0.3 + sentComp * 0.3) * 10) / 10));
                      } else {
                        // Fallback 2: use raw sentiment_score directly from forecast entries
                        const rawEntries = [
                          ...(fc.BTC || []), ...(fc.ETH || []), ...(fc.SOL || []),
                        ];
                        const forecastScores = rawEntries
                          .map(e => e.sentiment_score)
                          .filter((s): s is number => typeof s === 'number' && !isNaN(s));
                        if (forecastScores.length > 0) {
                          const rawAvg = forecastScores.reduce((sum, s) => sum + s, 0) / forecastScores.length;
                          avgSentiment = rawAvg > 5 ? rawAvg / 20 : rawAvg;
                          avgSentiment = Math.max(0, Math.min(5, avgSentiment));
                        }
                      }
                    }

                    const sentimentTag = avgSentiment === null ? 'neutral'
                      : avgSentiment <= 1.6 ? 'bearish'
                      : avgSentiment <= 3.3 ? 'neutral'
                      : 'bullish';

                    const tagConfig = {
                      bullish: { label: "BULLISH", color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.25)" },
                      neutral: { label: "NEUTRAL", color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
                      bearish: { label: "BEARISH", color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.25)" },
                    }[sentimentTag];

                    const dateObj = new Date(day.fetched_date + "T00:00:00");
                    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

                    const forecastCount = day.hourlyForecast
                      ? (day.hourlyForecast.BTC?.length || 0) + (day.hourlyForecast.ETH?.length || 0) + (day.hourlyForecast.SOL?.length || 0)
                      : 0;
                    const btcCount = day.hourlyForecast?.BTC?.length || 0;
                    const ethCount = day.hourlyForecast?.ETH?.length || 0;
                    const solCount = day.hourlyForecast?.SOL?.length || 0;
                    const topStory = day.crypto_news[0]?.title || day.macro_news[0]?.title || null;

                    return (
                      <div
                        key={day.fetched_date}
                        style={{
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: 14,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          padding: "14px 16px 12px",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.background = "rgba(167,139,250,0.05)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,139,250,0.18)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                        }}
                        onClick={() => onViewPastReport?.(day)}
                      >
                        {/* Row 1: Date + Pill badge */}
                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          paddingBottom: 11, marginBottom: 11,
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#586069" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span style={{ fontSize: 11, color: "#8b949e", fontWeight: 400, letterSpacing: "0.01em" }}>{formattedDate}</span>
                          </div>
                          <span style={{
                            fontSize: 9.5, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                            letterSpacing: "0.05em",
                            color: tagConfig.color,
                            background: tagConfig.bg,
                            border: `1px solid ${tagConfig.border}`,
                            display: "inline-flex", alignItems: "center", gap: 3,
                          }}>
                            <span style={{ fontSize: 10 }}>↑</span>{tagConfig.label}
                          </span>
                        </div>

                        {/* Row 2: CRYPTO / MACRO / FORECASTS with grid lines */}
                        <div style={{
                          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                          textAlign: "center", marginBottom: 2,
                          borderTop: "1px solid rgba(255,255,255,0.04)",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          paddingTop: 8, paddingBottom: 8,
                        }}>
                          <div style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
                            <div style={{ fontSize: 8.5, fontWeight: 600, color: "#586069", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Crypto</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{day.crypto_news.length}</div>
                          </div>
                          <div style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
                            <div style={{ fontSize: 8.5, fontWeight: 600, color: "#586069", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Macro</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{day.macro_news.length}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 8.5, fontWeight: 600, color: "#586069", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Forecasts</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: tagConfig.color, fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{forecastCount}</div>
                          </div>
                        </div>

                        {/* Row 3: BTC / ETH / SOL with grid lines */}
                        <div style={{
                          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                          textAlign: "center", marginBottom: 12,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          paddingTop: 6, paddingBottom: 8,
                        }}>
                          {[
                            { label: "BTC", val: btcCount },
                            { label: "ETH", val: ethCount },
                            { label: "SOL", val: solCount },
                          ].map(({ label, val }, i) => (
                            <div key={label} style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                              <div style={{ fontSize: 8.5, fontWeight: 500, color: "#484f58", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "#c9d1d9", fontFamily: "'DM Mono', monospace", lineHeight: 1.1 }}>{val}</div>
                            </div>
                          ))}
                        </div>

                        {/* Row 4: Top Story */}
                        {topStory && (
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 8.5, fontWeight: 600, color: "#586069", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Top Story</div>
                            <div style={{
                              fontSize: 11.5, color: "#c9d1d9", lineHeight: 1.4, fontWeight: 400,
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                              overflow: "hidden",
                            }}>{topStory}</div>
                          </div>
                        )}

                        {/* Row 5: Sentiment bar — thin, clean */}
                        {avgSentiment !== null && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 9.5, fontWeight: 500, color: "#586069", whiteSpace: "nowrap" }}>Sentiment</span>
                            <div style={{ flex: 1, position: "relative", height: 3 }}>
                              {/* Track */}
                              <div style={{
                                position: "absolute", inset: 0, borderRadius: 99,
                                background: "rgba(255,255,255,0.05)",
                              }} />
                              {/* Fill */}
                              <div style={{
                                position: "absolute", top: 0, bottom: 0, left: 0,
                                width: `${(avgSentiment / 5) * 100}%`,
                                borderRadius: 99,
                                background: `linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, ${tagConfig.color} 100%)`,
                              }} />
                            </div>
                            <span style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: 12, fontWeight: 700,
                              color: tagConfig.color,
                              whiteSpace: "nowrap",
                            }}>
                              {avgSentiment.toFixed(1)}/5
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Stats */}
            <div style={{ padding: "13px 15px", flexShrink: 0 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#a78bfa", marginBottom: 9,
              }}>
                <Activity size={10} />
                Live Stats
              </div>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, overflow: "hidden",
              }}>
                {[
                  { label: "Active agents", value: "0", color: null as string | null, altBg: false },
                  { label: "ZK proofs", value: "—", color: null as string | null, altBg: true },
                  { label: "Credits today", value: "0.00", color: null as string | null, altBg: false },
                  { label: "Network", value: "Mainnet", color: "#34d399" as string | null, altBg: true },
                ].map(({ label, value, color, altBg }, i) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "6px 11px",
                    background: altBg ? "rgba(255,255,255,0.015)" : "transparent",
                    borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{label}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: color ? 500 : 400, color: color || "#e2e8f0" }}>
                      {color && (
                        <span style={{
                          display: "inline-block", width: 5, height: 5, borderRadius: "50%",
                          background: color, boxShadow: `0 0 5px ${color}`,
                          marginRight: 5, animation: "blink 2s infinite",
                        }} />
                      )}
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  );
};

export default ZkTerminal;
