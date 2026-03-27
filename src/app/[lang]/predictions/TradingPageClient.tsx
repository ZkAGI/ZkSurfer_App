'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import PredictionPanel from '@/component/ui/PredictionPanel';
import { TradingChart } from '@/component/ui/TradingChart';
import OrderBook from '@/component/ui/OrderBook';
import { ArrowLeft, TrendingUp, Activity, BarChart3, Terminal } from 'lucide-react';

const TradingPageClient: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string || 'en';

  return (
    <div style={{
      minHeight: "100vh", background: "#07090f",
      fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0",
    }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 22px",
        background: "rgba(11,13,22,0.9)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => router.push(`/${lang}/home`)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6b7280", cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/images/tiger.svg" alt="ZkTerminal" style={{
              width: 34, height: 34, borderRadius: 10,
              boxShadow: "0 0 16px rgba(124,106,247,0.3)",
            }} />
            <h1 style={{
              fontSize: 18, fontWeight: 700, color: "#f1f5f9",
              fontFamily: "'Syne', sans-serif",
            }}>Prediction Dashboard</h1>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 99,
          background: "rgba(52,211,153,0.06)",
          border: "1px solid rgba(52,211,153,0.15)",
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#34d399",
            animation: "blink 1.4s infinite",
          }} />
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#34d399", fontWeight: 600 }}>
            Live Data
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 18px" }}>
        {/* Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12, marginBottom: 20,
        }}>
          {[
            { label: "Market Status", value: "Markets Open", icon: Activity, color: "#34d399", showDot: true },
            { label: "Today's Predictions", value: "24", icon: TrendingUp, color: "#a78bfa" },
            { label: "Accuracy Rate", value: "78.5%", icon: BarChart3, color: "#f59e0b" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "14px 18px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{stat.label}</span>
                <stat.icon size={14} color={stat.color} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {stat.showDot && (
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#34d399",
                    animation: "blink 1.4s infinite",
                  }} />
                )}
                <span style={{
                  fontSize: 16, fontWeight: 600, color: "#f1f5f9",
                  fontFamily: stat.label !== "Market Status" ? "'DM Mono', monospace" : undefined,
                }}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 14,
        }}>
          {/* Desktop: 3-column layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}>
            {/* Prediction Panel */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "18px 20px",
              overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
              }}>
                <TrendingUp size={15} color="#a78bfa" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>AI Predictions</span>
              </div>
              <PredictionPanel />
            </div>

            {/* Trading Chart - takes 2x width on large screens */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "18px 20px",
              gridColumn: "span 1",
              minHeight: 440,
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BarChart3 size={15} color="#34d399" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Price Chart</span>
                </div>
                <span style={{
                  fontSize: 11, fontFamily: "'DM Mono', monospace",
                  color: "#6b7280",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "3px 10px", borderRadius: 8,
                }}>BTC/USDT</span>
              </div>
              <div style={{ height: 380 }}>
                <TradingChart />
              </div>
            </div>

            {/* Order Book */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "18px 20px",
              overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
              }}>
                <Activity size={15} color="#f59e0b" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Order Book</span>
              </div>
              <OrderBook coin="BTC" depth={10} />
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default TradingPageClient;
