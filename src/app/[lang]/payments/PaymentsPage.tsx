'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { CreditCard, ArrowLeft, Zap, History, Package, X, Loader2 } from 'lucide-react';

interface RechargeOption {
  package: string;
  credits: string;
  price: string;
  popular?: boolean;
}

const rechargeOptions: RechargeOption[] = [
  { package: '1', credits: '5,000',   price: '$10' },
  { package: '2', credits: '10,000',  price: '$15', popular: true },
  { package: '3', credits: '25,000',  price: '$30' },
  { package: '4', credits: '50,000',  price: '$50' },
  { package: '5', credits: '100,000', price: '$90' },
  { package: '6', credits: '200,000', price: '$140' },
  { package: '7', credits: '500,000', price: '$300' },
];

const PAYMENT_HISTORY_URL = 'https://zynapse.zkagi.ai/v1/payment-history';
const API_KEY             = 'zk-123321';

const PaymentsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string || 'en';
  const { publicKey } = useWallet();

  const [activeTab,       setActiveTab]       = useState<'recharge'|'past'>('recharge');
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [selectedPkg,     setSelectedPkg]     = useState<RechargeOption | null>(null);
  const [pastPayments,    setPastPayments]    = useState<any[]>([]);
  const [loadingPast,     setLoadingPast]     = useState(false);
  const [errorPast,       setErrorPast]       = useState<string|null>(null);

  // Whenever we switch into "Past Payments", fetch the history
  useEffect(() => {
    if (activeTab !== 'past' || !publicKey) return;

    setLoadingPast(true);
    setErrorPast(null);

    fetch(PAYMENT_HISTORY_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        wallet_address: publicKey.toString(),
      }),
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setPastPayments(data);
        } else if (Array.isArray(data.payments)) {
          setPastPayments(data.payments);
        } else {
          setPastPayments([data]);
        }
      })
      .catch(err => {
        console.error("Error loading payment history:", err);
        setErrorPast(err.message);
      })
      .finally(() => setLoadingPast(false));
  }, [activeTab, publicKey]);

  const openBuyModal = (pkg: RechargeOption) => {
    setSelectedPkg(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-dsBg">
      {/* Header */}
      <div className="ds-topbar sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${lang}/home`)}
            className="w-9 h-9 rounded-lg bg-dsBorder/50 hover:bg-dsBorder flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-dsMuted" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-dsPurple/15 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-dsPurple-light" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Payments</h1>
            <p className="text-xs text-dsMuted">Manage credits & payment history</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="ds-tabs mb-8">
          <button
            className={`ds-tab ${activeTab === 'recharge' ? 'active' : ''}`}
            onClick={() => setActiveTab('recharge')}
          >
            <Zap className="w-4 h-4" />
            Recharge Credits
          </button>
          <button
            className={`ds-tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            <History className="w-4 h-4" />
            Payment History
          </button>
        </div>

        {activeTab === 'recharge' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rechargeOptions.map(opt => (
              <div
                key={opt.package}
                className={`ds-card relative hover:border-dsPurple/50 transition-all cursor-pointer group ${
                  opt.popular ? 'border-dsPurple/30' : ''
                }`}
                onClick={() => openBuyModal(opt)}
              >
                {opt.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="ds-badge-popular text-xs px-3 py-1">Most Popular</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-dsGreen/15 flex items-center justify-center">
                    <Package className="w-5 h-5 text-dsGreen" />
                  </div>
                  <span className="text-dsMuted text-sm">Package {opt.package}</span>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white">{opt.credits}</span>
                  <span className="text-dsMuted ml-2">credits</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold text-dsPurple-light">{opt.price}</span>
                  <button className="ds-btn-primary text-sm py-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="ds-card">
            {loadingPast && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-dsPurple animate-spin" />
                <span className="ml-3 text-dsMuted">Loading payment history...</span>
              </div>
            )}
            {errorPast && (
              <div className="ds-alert-error">
                <p>Error: {errorPast}</p>
              </div>
            )}
            {!loadingPast && !errorPast && pastPayments.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-dsBorder/50 flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-dsMuted" />
                </div>
                <p className="text-white font-medium mb-2">No Payment History</p>
                <p className="text-dsMuted text-sm">Your past payments will appear here</p>
              </div>
            )}
            {!loadingPast && pastPayments.length > 0 && (
              <div className="overflow-x-auto">
                <table className="ds-table">
                  <thead>
                    <tr>
                      {Object.keys(pastPayments[0]).map(key => (
                        <th key={key}>
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pastPayments.map((record, i) => (
                      <tr key={i}>
                        {Object.values(record).map((val, j) => (
                          <td key={j}>
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {isModalOpen && selectedPkg && (
        <div className="ds-modal-backdrop">
          <div className="ds-modal w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="ds-heading-md">Confirm Purchase</h2>
              <button
                className="w-9 h-9 rounded-lg bg-dsBorder/50 hover:bg-dsBorder flex items-center justify-center transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5 text-dsMuted" />
              </button>
            </div>

            <div className="bg-dsBg rounded-xl p-4 mb-6 border border-dsBorder">
              <div className="flex items-center justify-between mb-3">
                <span className="text-dsMuted">Package</span>
                <span className="text-white font-medium">Package {selectedPkg.package}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-dsMuted">Credits</span>
                <span className="text-dsGreen font-bold">{selectedPkg.credits}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-dsBorder">
                <span className="text-dsMuted">Total</span>
                <span className="text-2xl font-bold text-white">{selectedPkg.price}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="ds-btn-ghost flex-1"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button className="ds-btn-primary flex-1">
                <CreditCard className="w-4 h-4" />
                Pay {selectedPkg.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
