'use client';

import React from 'react';
import PredictionPanel from '@/component/ui/PredictionPanel';
import { TradingChart } from '@/component/ui/TradingChart';
import OrderBook from '@/component/ui/OrderBook';

const TradingPageClient: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 p-3">
      <div className="flex flex-col mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Prediction Dashboard</h1>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div><PredictionPanel /></div>
            <div className="md:col-span-2 h-full"><TradingChart /></div>
            <div><OrderBook coin="BTC" depth={10} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPageClient;
