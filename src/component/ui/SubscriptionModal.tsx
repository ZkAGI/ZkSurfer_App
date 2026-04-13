'use client';
import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import { X, CreditCard, Coins, Check, Shield, Zap, ChevronRight, Loader2, Search, Info } from 'lucide-react';
import { useCoinGecko } from '@/hooks/useCoinGecko';
import { buildSolanaPayURL, waitForSolanaPay } from '@/lib/solanaPay';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { recordSubscription, getSubscriptionType, RecordSubscriptionPayload, verifySubscription } from '@/lib/subscriptionApi';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useModelStore } from '@/stores/useModel-store';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  treasuryWallet: string;
  onSubscriptionSuccess?: (planId: string, orderData: any, usdAmount: number) => void;
  onSingleReportSuccess?: (orderData: any, usdAmount: number) => void;
}

const SUBSCRIPTION_PLANS = [
  {
    id: 'single-report',
    name: 'Single Report',
    usdPrice: 5,
    duration: '24 hours access',
    features: [
      'One premium prediction report',
      'Current market analysis',
      '24-hour access',
      'No commitment required'
    ],
    popular: false,
    badge: 'TRY NOW',
    type: 'single' as const,
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    usdPrice: 100,
    duration: '3 months',
    features: [
      'Premium prediction reports',
      'Advanced market analysis',
      'Trading signals',
      'Unlimited access'
    ],
    popular: false,
    type: 'subscription' as const,
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    usdPrice: 300,
    duration: '12 months',
    features: [
      'Premium prediction reports',
      'Advanced market analysis',
      'Trading signals',
      'Priority support',
      'VIP community access'
    ],
    popular: true,
    badge: 'BEST VALUE',
    type: 'subscription' as const,
  },
];

const FIAT_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export default function SubscriptionModal({
  isOpen,
  onClose,
  treasuryWallet,
  onSubscriptionSuccess,
  onSingleReportSuccess,
}: SubscriptionModalProps) {
  const { publicKey } = useWallet();
  const connectedWallet = publicKey?.toBase58();

  const [selectedPlan, setSelectedPlan] = useState('single-report');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'solana'>('stripe');
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [solanaPayURL, setSolanaPayURL] = useState<string>('');
  const [referencePubKey, setReferencePubKey] = useState<PublicKey | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { userEmail } = useModelStore();
  const { checkSubscription } = useSubscriptionStore();

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)!;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan('single-report');
      setPaymentMethod('stripe');
      setSolanaPayURL('');
      setReferencePubKey(null);
      setIsProcessing(false);
      setIsChecking(false);
    }
  }, [isOpen]);

  const handleStripePayment = async () => {
    if (!connectedWallet || !userEmail) {
      toast.error('❌ Wallet and email are required for Stripe payment');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          walletAddress: connectedWallet,
          email: userEmail,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create checkout session');
      }

      window.location.href = responseData.url;
      
    } catch (error) {
      console.error('❌ Error creating Stripe session:', error);
      toast.error(`❌ ${error instanceof Error ? error.message : 'Failed to initialize Stripe payment'}`);
      setIsProcessing(false);
    }
  };

  const handleSolanaPay = async () => {
    if (!connectedWallet) {
      toast.error('❌ Please connect your wallet first');
      return;
    }

    setIsProcessing(true);

    try {
      const { reference: referenceString } = await fetch('/api/solana/createReference', {
        method: 'POST',
        body: JSON.stringify({ plan: selectedPlan }),
      }).then(r => r.json());

      const reference = new PublicKey(referenceString);
      setReferencePubKey(reference);

      const url = buildSolanaPayURL(currentPlan.usdPrice, reference);
      setSolanaPayURL(url.toString());
    } catch (error) {
      console.error('❌ Error initializing Solana Pay:', error);
      toast.error('❌ Failed to initialize Solana Pay. Please try again.');
      setIsProcessing(false);
    }
  };

  async function pollVerify(
    wallet: string,
    attempts = 5,
    delayMs = 1000
  ): Promise<ReturnType<typeof verifySubscription>> {
    for (let i = 0; i < attempts; i++) {
      const result = await verifySubscription(wallet);
      if (result.success) return result;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new Error('Verification timed out');
  }

  const handleCheckSolanaPayment = async () => {
    if (!referencePubKey || !connectedWallet) return;
    setIsChecking(true);
    try {
      const result = await waitForSolanaPay(referencePubKey, currentPlan.usdPrice);
      if (result.signature && result.payerWallet) {
        const subscriptionData: RecordSubscriptionPayload = {
          walletAddress: connectedWallet,
          email: userEmail || '',
          subscription_type: getSubscriptionType(selectedPlan),
          createdAt: result.timestamp || new Date().toISOString(),
          relayerTransactionId: '',
          requestId: '',
          depositAddress: result.payerWallet,
          transactionHash: result.signature,
          transactionStatus: 'COMPLETED'
        };

        const recordResult = await recordSubscription(subscriptionData);
        if (recordResult.success) {
          await pollVerify(connectedWallet);
          await checkSubscription(connectedWallet);
          
          if (currentPlan.type === 'single') {
            onSingleReportSuccess?.(result, currentPlan.usdPrice);
          } else {
            onSubscriptionSuccess?.(selectedPlan, result, currentPlan.usdPrice);
          }
          
          toast.success(`🎉 Payment successful! Subscription activated.`);
          onClose();
        } else {
          toast.error(`⚠️ Payment recorded but failed to activate subscription.`);
        }
      }
    } catch (err) {
      console.error('❌ No payment yet or error:', err);
      toast.info('Payment not detected yet. Please ensure you have sent the transaction.');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'stripe') {
      handleStripePayment();
    } else {
      if (solanaPayURL) {
        handleCheckSolanaPayment();
      } else {
        handleSolanaPay();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
    }}>
      <div style={{
        position: "relative",
        background: "#0c1019",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        maxWidth: 860, width: "100%", margin: "0 16px",
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#e2e8f0",
      }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(12,16,25,0.95)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "20px 24px",
          borderRadius: "20px 20px 0 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{
              fontSize: 22, fontWeight: 700, color: "#f1f5f9",
              fontFamily: "'Syne', sans-serif", marginBottom: 4,
            }}>{currentPlan.name} Access</h2>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Unlock premium reports and real-time market insights
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6b7280", cursor: "pointer", flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Plan Selection */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#4b5563", marginBottom: 14,
            }}>Choose Your Plan</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}>
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setSolanaPayURL('');
                    setReferencePubKey(null);
                  }}
                  style={{
                    position: "relative",
                    padding: "20px 18px",
                    borderRadius: 14,
                    border: selectedPlan === plan.id
                      ? "1.5px solid rgba(124,106,247,0.5)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: selectedPlan === plan.id
                      ? "rgba(124,106,247,0.06)"
                      : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {plan.badge && (
                    <div style={{
                      position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                      background: plan.id === 'yearly' ? "linear-gradient(135deg, #7c6af7, #4338ca)" : "rgba(52,211,153,0.15)",
                      color: "#fff", fontSize: 10, fontWeight: 700,
                      padding: "3px 12px", borderRadius: 99,
                      letterSpacing: "0.05em",
                    }}>{plan.badge}</div>
                  )}
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{plan.name}</div>
                    <div style={{
                      fontSize: 28, fontWeight: 700,
                      fontFamily: "'DM Mono', monospace",
                      color: selectedPlan === plan.id ? "#a78bfa" : "#34d399",
                      marginBottom: 2,
                    }}>${plan.usdPrice}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{plan.duration}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9ca3af" }}>
                        <Check size={12} color={selectedPlan === plan.id ? "#a78bfa" : "#34d399"} style={{ flexShrink: 0 }} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#4b5563", marginBottom: 10,
            }}>Payment Method</div>
            <div style={{
              display: "flex",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: 3,
            }}>
              <button
                onClick={() => { setPaymentMethod('stripe'); setSolanaPayURL(''); }}
                style={{
                  flex: 1, padding: "10px 16px", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                  background: paymentMethod === 'stripe' ? "rgba(124,106,247,0.15)" : "transparent",
                  color: paymentMethod === 'stripe' ? "#a78bfa" : "#6b7280",
                }}
              >
                <CreditCard size={15} />
                Fiat Currency
              </button>
              <button
                onClick={() => setPaymentMethod('solana')}
                style={{
                  flex: 1, padding: "10px 16px", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                  background: paymentMethod === 'solana' ? "rgba(124,106,247,0.15)" : "transparent",
                  color: paymentMethod === 'solana' ? "#a78bfa" : "#6b7280",
                }}
              >
                <Coins size={15} />
                Cryptocurrency
              </button>
            </div>
          </div>

          {/* Dynamic Payment Content */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "24px",
            marginBottom: 20,
          }}>
            {paymentMethod === 'stripe' ? (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "rgba(124,106,247,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <CreditCard size={24} color="#a78bfa" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>Pay with Card</h3>
                <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 300, margin: "0 auto 20px" }}>
                  Pay securely via Stripe using Credit Card, Apple Pay, or Google Pay.
                </p>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
                  maxWidth: 320, margin: "0 auto",
                }}>
                  {FIAT_CURRENCIES.slice(0, 9).map(c => (
                    <div key={c.code} onClick={() => setSelectedFiatCurrency(c.code)} style={{
                      padding: "8px", borderRadius: 8, border: selectedFiatCurrency === c.code ? "1px solid #7c6af7" : "1px solid transparent",
                      background: "rgba(255,255,255,0.03)", fontSize: 11, cursor: "pointer",
                      color: selectedFiatCurrency === c.code ? "#a78bfa" : "#6b7280",
                    }}>
                      {c.code}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                {solanaPayURL ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ padding: 12, background: "#fff", borderRadius: 12, marginBottom: 16 }}>
                      <QRCode value={solanaPayURL} size={160} />
                    </div>
                    <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                      Scan with Phantom, Solflare or any Solana wallet
                    </p>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
                      padding: "8px 16px", borderRadius: 8, color: "#34d399", fontSize: 13,
                    }}>
                      <Info size={14} />
                      Amount: {currentPlan.usdPrice} USDC
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: "rgba(52,211,153,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 16px",
                    }}>
                      <Coins size={24} color="#34d399" />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>Pay with Solana</h3>
                    <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 300, margin: "0 auto 20px" }}>
                      Scan a QR code to pay instantly with USDC on Solana.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || isChecking}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 12,
              background: isProcessing || isChecking
                ? "rgba(255,255,255,0.04)"
                : "linear-gradient(135deg, #7c6af7, #4338ca)",
              border: "none",
              color: isProcessing || isChecking ? "#6b7280" : "#fff",
              fontSize: 15, fontWeight: 700,
              cursor: isProcessing || isChecking ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.15s",
              marginBottom: 16,
            }}
          >
            {isProcessing || isChecking ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                {isChecking ? 'Verifying...' : 'Processing...'}
              </>
            ) : (
              <>
                <Zap size={16} />
                {paymentMethod === 'solana' && solanaPayURL ? 'Verify Payment' : `Pay $${currentPlan.usdPrice}`}
                <ChevronRight size={16} />
              </>
            )}
          </button>

          {/* Footer */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4b5563" }}>
              <Shield size={11} />
              Secure payment
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4b5563" }}>
              <Zap size={11} />
              Instant access
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
