'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import PredictionPanel from '@/component/ui/PredictionPanel';
import { TradingChart } from '@/component/ui/TradingChart';
import OrderBook from '@/component/ui/OrderBook';
import { ArrowLeft, TrendingUp, Activity, BarChart3 } from 'lucide-react';

const TradingPageClient: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string || 'en';

  return (
    <div className="min-h-screen bg-dsBg">
      {/* Header */}
      <div className="ds-topbar sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${lang}/home`)}
            className="w-9 h-9 rounded-lg bg-dsBorder/50 flex items-center justify-center
                       text-dsMuted hover:text-white hover:bg-dsBorder transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600
                            flex items-center justify-center shadow-lg shadow-amber-500/20">
              <TrendingUp size={16} className="text-white" />
            </div>
            <h1 className="ds-heading-md">Prediction Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-dsGreen/10 border border-dsGreen/20">
            <div className="w-2 h-2 rounded-full bg-dsGreen animate-pulse" />
            <span className="text-xs font-dmMono text-dsGreen">Live Data</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="ds-stats-panel">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dsMuted">Market Status</span>
              <Activity size={14} className="text-dsGreen" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dsGreen animate-pulse" />
              <span className="text-white font-semibold">Markets Open</span>
            </div>
          </div>

          <div className="ds-stats-panel">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dsMuted">Today&apos;s Predictions</span>
              <TrendingUp size={14} className="text-dsPurple-light" />
            </div>
            <span className="text-white font-semibold font-dmMono">24</span>
          </div>

          <div className="ds-stats-panel">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dsMuted">Accuracy Rate</span>
              <BarChart3 size={14} className="text-amber-400" />
            </div>
            <span className="text-white font-semibold font-dmMono">78.5%</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Prediction Panel */}
          <div className="lg:col-span-1">
            <div className="ds-card h-full">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-dsPurple-light" />
                <h3 className="text-sm font-semibold text-white">AI Predictions</h3>
              </div>
              <PredictionPanel />
            </div>
          </div>

          {/* Trading Chart */}
          <div className="lg:col-span-2">
            <div className="ds-card h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-dsGreen" />
                  <h3 className="text-sm font-semibold text-white">Price Chart</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="ds-badge-number">BTC/USDT</span>
                </div>
              </div>
              <div className="h-[400px]">
                <TradingChart />
              </div>
            </div>
          </div>

          {/* Order Book */}
          <div className="lg:col-span-1">
            <div className="ds-card h-full">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Order Book</h3>
              </div>
              <OrderBook coin="BTC" depth={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPageClient;
