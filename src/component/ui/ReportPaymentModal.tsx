import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
import { createFundKitConfig } from '@/lib/aarcConfig';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { recordSubscription, getSubscriptionType, RecordSubscriptionPayload, verifySubscription } from '@/lib/subscriptionApi';
import { buildSolanaPayURL, waitForSolanaPay } from '@/lib/solanaPay';
import { PublicKey } from '@solana/web3.js';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { useModelStore } from '@/stores/useModel-store';
import { Magic } from 'magic-sdk';
import { toast } from 'sonner';

interface PaymentPlan {
  id: string;
  name: string;
  usdPrice: number;
  duration: string;
  features: string[];
  popular?: boolean;
  badge?: string;
  color: 'orange' | 'blue' | 'green';
}

const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    usdPrice: 6.9,
    duration: '1 month',
    features: [
      'All premium prediction reports',
      'Advanced market analysis',
      'Trading signals',
      'Unlimited access',
    ],
    color: 'blue',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    usdPrice: 500,
    duration: '12 months',
    features: [
      'All premium prediction reports',
      'Advanced market analysis',
      'Trading signals',
      'Priority support',
      'VIP community access',
    ],
    popular: true,
    badge: 'BEST VALUE',
    color: 'green',
  },
];

// Flow steps enum
enum PaymentStep {
  PLAN_SELECTION = 'plan_selection',
  EMAIL_INPUT = 'email_input',
  TERMS_ACCEPTANCE = 'terms_acceptance',
  PAYMENT_METHOD_SELECTION = 'payment_method_selection',
  SOLANA_PAY_QR = 'solana_pay_qr',
  AARC_PROCESSING = 'aarc_processing',
   STRIPE_PROCESSING = 'stripe_processing' 
}

export interface ReportPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (planId: string, orderData: any, usdAmount: number) => void;
  receivingWallet?: string;
  connectedWallet?: string;
}

export default function ReportPaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  receivingWallet = '0x01e919a01a7beff155bcEa5F42eF140881EF5E3a',
  connectedWallet,
}: ReportPaymentModalProps) {
  // Existing state
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_AARC_API_KEY || '';
  const [solanaPayURL, setSolanaPayURL] = useState<string>('');
  const [referencePubKey, setReferencePubKey] = useState<PublicKey | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // New state for enhanced flow
  const [currentStep, setCurrentStep] = useState<PaymentStep>(PaymentStep.PLAN_SELECTION);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'aarc' | 'solana' | 'stripe' |  null>(null);

  const [userInputEmail, setUserInputEmail] = useState<string>('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState<boolean>(false);
  const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '');

  const { userEmail, setUserEmail } = useModelStore();
  const { checkSubscription, setPaymentSession, clearPaymentSession, getPaymentSession } = useSubscriptionStore();

  const verifyEmailWithMagic = async (email: string) => {
    // send OTP
    const didToken = await magic.auth.loginWithEmailOTP({ email });
    // now user is momentarily “logged in,” so fetch their verified email
    const userInfo = await magic.user.getInfo();
    // persist it in your database
    // await storeUserEmail(connectedWallet!, userInfo.email);
    // update your UI store
    setUserEmail(userInfo.email);
    // log them back out instantly
    await magic.user.logout();
    return userInfo.email;
  };


  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(PaymentStep.PLAN_SELECTION);
      setSelectedPlan('');
      // setUserInputEmail('');
      // setOtpCode('');
      setTermsAccepted(false);
      setSelectedPaymentMethod(null);
    }
  }, [isOpen]);

  // Handle plan selection and determine next step
  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);

    // Check if user has email (Magic Link user)
    if (userEmail) {
      console.log('📧 Magic Link user detected:', userEmail);
      setCurrentStep(PaymentStep.TERMS_ACCEPTANCE);
    } else {
      // setCurrentStep(PaymentStep.TERMS_ACCEPTANCE);
      setCurrentStep(PaymentStep.EMAIL_INPUT);
    }
  };

  const handleEmailVerification = async () => {
    if (!userInputEmail) {
      toast.warning('Please enter an email address');
      return;
    }
    setIsVerifyingEmail(true);
    try {
      await verifyEmailWithMagic(userInputEmail);
      // now that userEmail is set, drop into terms step:
      setCurrentStep(PaymentStep.TERMS_ACCEPTANCE);
    } catch (err) {
      console.error('Email verification failed', err);
      toast.error('Could not verify email. Please try again.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };


  // Handle terms acceptance
  const handleTermsAcceptance = () => {
    if (!termsAccepted) {
      toast.warning('Please accept the terms and conditions to continue');
      return;
    }
    setCurrentStep(PaymentStep.PAYMENT_METHOD_SELECTION);
  };

  // Update your handleStripePayment function to show the real error
const handleStripePayment = async (planId: string) => {
  if (!connectedWallet || !userEmail) {
    toast.error('❌ Wallet and email are required for Stripe payment');
    return;
  }

  setIsProcessing(true);

  try {
    console.log('🚀 Initiating Stripe payment for:', { planId, connectedWallet, userEmail });
    
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        walletAddress: connectedWallet,
        email: userEmail,
      }),
    });

    // 🔍 DEBUG: Log the actual response
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response text first to see raw response
    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('📥 Parsed response:', responseData);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      console.error('Raw response was:', responseText);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!response.ok) {
      console.error('❌ API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      // Show the actual error from the server
      const errorMessage = responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Server Error: ${errorMessage}`);
    }

    const { sessionId, url } = responseData;

    if (!url) {
      throw new Error('No checkout URL received from Stripe');
    }

    console.log('✅ Redirecting to Stripe checkout:', url);
    
    // Redirect to Stripe Checkout
    window.location.href = url;
    
  } catch (error) {
    console.error('❌ Full Error Details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Show the actual error instead of generic message
    toast.error(`❌ ${errorMessage}`);
    setIsProcessing(false);
    setCurrentStep(PaymentStep.PAYMENT_METHOD_SELECTION);
  }
};

  //  const handleStripePayment = async (planId: string) => {
  //   if (!connectedWallet || !userEmail) {
  //     toast.error('❌ Wallet and email are required for Stripe payment');
  //     return;
  //   }

  //   setIsProcessing(true);

  //   try {
  //     const response = await fetch('/api/stripe/create-checkout-session', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         planId,
  //         walletAddress: connectedWallet,
  //         email: userEmail,
  //       }),
  //     });

  //     const { sessionId, url } = await response.json();

  //     if (!response.ok) {
  //       throw new Error('Failed to create checkout session');
  //     }

  //     // Redirect to Stripe Checkout
  //     window.location.href = url;
      
  //   } catch (error) {
  //     console.error('❌ Error creating Stripe session:', error);
  //     toast.error('❌ Failed to initialize Stripe payment. Please try again.');
  //     setIsProcessing(false);
  //     setCurrentStep(PaymentStep.PAYMENT_METHOD_SELECTION);
  //   }
  // };

  // Handle payment method selection
  const handlePaymentMethodSelection = (method: 'aarc' | 'solana' | 'stripe') => {
    setSelectedPaymentMethod(method);

    if (method === 'solana') {
      handleSolanaPay(selectedPlan);
      setCurrentStep(PaymentStep.SOLANA_PAY_QR);
    } else if (method === 'stripe') {
      handleStripePayment(selectedPlan);
      setCurrentStep(PaymentStep.STRIPE_PROCESSING);
    }else {
      handleFundKitPayment(selectedPlan);
      setCurrentStep(PaymentStep.AARC_PROCESSING);
    }
  };

  // Go back to previous step
  const handleGoBack = () => {
    switch (currentStep) {
      case PaymentStep.TERMS_ACCEPTANCE:
        setCurrentStep(PaymentStep.PLAN_SELECTION);
        break;
      case PaymentStep.PAYMENT_METHOD_SELECTION:
        setCurrentStep(PaymentStep.TERMS_ACCEPTANCE);
        break;
      case PaymentStep.SOLANA_PAY_QR:
        setCurrentStep(PaymentStep.PAYMENT_METHOD_SELECTION);
        setSolanaPayURL('');
        setReferencePubKey(null);
        setIsProcessing(false);
        break;
      case PaymentStep.STRIPE_PROCESSING: // NEW
        setCurrentStep(PaymentStep.PAYMENT_METHOD_SELECTION);
        setIsProcessing(false);
        break;
      default:
        setCurrentStep(PaymentStep.PLAN_SELECTION);
    }
  };

  // Existing payment functions (unchanged)
  const handleSolanaPay = async (planId: string) => {
    const plan = PAYMENT_PLANS.find(p => p.id === planId);
    if (!plan || !connectedWallet) return;

    const { reference: referenceString } = await fetch('/api/solana/createReference', {
      method: 'POST',
      body: JSON.stringify({ plan: planId }),
    }).then(r => r.json());

    const reference = new PublicKey(referenceString);
    setReferencePubKey(reference);

    const url = buildSolanaPayURL(plan.usdPrice, reference);
    setSolanaPayURL(url.toString());
    setIsProcessing(true);
  };


  async function pollVerify(
    wallet: string,
    attempts = 5,
    delayMs = 500
  ): Promise<ReturnType<typeof verifySubscription>> {
    for (let i = 0; i < attempts; i++) {
      const result = await verifySubscription(wallet)
      if (result.success) {
        return result
      }
      // wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
    throw new Error('verification timed out')
  }

  const recordSolanaPaySubscription = async (paymentResult: any, planId: string) => {

    const plan = PAYMENT_PLANS.find(p => p.id === planId);
    if (!plan) {
      console.error(`Unknown planId ${planId}`);
      return;
    }

    try {
      console.log('📝 Recording Solana Pay subscription...');

      if (!connectedWallet) {
        throw new Error('No connected wallet found');
      }

      const subscriptionData: RecordSubscriptionPayload = {
        walletAddress: connectedWallet,
        email: userEmail,
        subscription_type: getSubscriptionType(planId),
        createdAt: paymentResult.timestamp || new Date().toISOString(),
        relayerTransactionId: '',
        requestId: '',
        depositAddress: paymentResult.payerWallet,
        transactionHash: paymentResult.signature,
        transactionStatus: 'COMPLETED'
      };

      console.log('📤 Sending subscription data:', subscriptionData);

      const recordResult = await recordSubscription(subscriptionData);

      console.log('recordResult', recordResult)

      if (recordResult.success) {

        try {
          // 1) poll the verify endpoint until it succeeds (or times out)
          const verification = await pollVerify(subscriptionData.walletAddress)
          console.log('✅ Backend verification succeeded:', verification)

          if (verification.success) {
            const { setSubscriptionStatus } = useSubscriptionStore.getState();
            setSubscriptionStatus({
              success: true,
              walletAddress: connectedWallet
            });
            console.log('✅ Store set to subscribed = true');
          }
        } catch (err) {
          console.warn('⚠️ Verification still pending after retries:', err)
          // you can decide to bail out here, or still proceed to set local state
        }
        await checkSubscription(connectedWallet);
        onPaymentSuccess?.(planId, paymentResult, plan.usdPrice);
        console.log('✅ Solana Pay subscription recorded successfully!');
        // await checkSubscription(connectedWallet);
        toast.success(`🎉 Payment successful! Subscription activated for wallet: ${connectedWallet}`);
        onClose();
      } else {
        console.error('❌ Failed to record subscription:', recordResult.message);
        toast.error(`⚠️ Payment successful but failed to activate subscription. Signature: ${paymentResult.signature}`);
      }
    } catch (error) {
      console.error('❌ Error recording Solana subscription:', error);
      toast.error(`⚠️ Payment found but API call failed. Signature: ${paymentResult.signature}`);
    }
  };

  const handleCheckPayment = async () => {
    if (!referencePubKey || !selectedPlan) return;
    setIsChecking(true);
    try {
      const plan = PAYMENT_PLANS.find(p => p.id === selectedPlan)!;
      console.log('🔎 Checking Solana Pay...');
      const result = await waitForSolanaPay(referencePubKey, plan.usdPrice);
      console.log('✅ Payment found!', result);
      if (result.signature && result.payerWallet) {
        await recordSolanaPaySubscription(result, selectedPlan);
      }
    } catch (err) {
      console.error('❌ No payment yet or error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleFundKitPayment = (planId: string) => {
    if (!apiKey) {
      toast.error('❌ Missing AARC API key');
      return;
    }

    if (!connectedWallet) {
      toast.error('❌ Please connect your wallet first');
      return;
    }

    const plan = PAYMENT_PLANS.find((p) => p.id === planId);
    if (!plan) return;

    setIsProcessing(true);
    setPaymentSession(planId, connectedWallet);

    const baseConfig = createFundKitConfig(apiKey, 0, receivingWallet);

    const modal = new AarcFundKitModal({
      ...baseConfig,
      events: {
        ...baseConfig.events,
        onTransactionSuccess: async (data: any) => {
          console.log('✅ Transaction success data:', data);

          try {
            const paymentSession = getPaymentSession();
            const actualPlanId = paymentSession.planId || planId;
            const actualUserWallet = paymentSession.userWallet || connectedWallet;

            if (!actualUserWallet) {
              throw new Error('No user wallet address available');
            }

            const aarcData = data.data || {};

            const subscriptionData: RecordSubscriptionPayload = {
              walletAddress: actualUserWallet,
              email: userEmail,
              subscription_type: getSubscriptionType(actualPlanId),
              createdAt: aarcData.createdAt ? String(aarcData.createdAt) : new Date().toISOString(),
              relayerTransactionId: aarcData.relayerTransactionId ? String(aarcData.relayerTransactionId) : '',
              requestId: aarcData.requestId ? String(aarcData.requestId) : '',
              depositAddress: aarcData.depositAddress ? String(aarcData.depositAddress) : '',
              transactionHash: aarcData.transactionHash ? String(aarcData.transactionHash) : (aarcData.txHash ? String(aarcData.txHash) : ''),
              transactionStatus: aarcData.transactionStatus ? String(aarcData.transactionStatus) : 'COMPLETED',
            };

            const recordResult = await recordSubscription(subscriptionData);

            if (recordResult.success) {

              try {
                // 1) poll the verify endpoint until it succeeds (or times out)
                const verification = await pollVerify(subscriptionData.walletAddress)
                console.log('✅ Backend verification succeeded:', verification)

                if (verification.success) {
                  const { setSubscriptionStatus } = useSubscriptionStore.getState();
                  setSubscriptionStatus({
                    success: true,
                    walletAddress: connectedWallet
                  });
                  console.log('✅ Store set to subscribed = true');
                }


              } catch (err) {
                console.warn('⚠️ Verification still pending after retries:', err)
                // you can decide to bail out here, or still proceed to set local state
              }
              await checkSubscription(actualUserWallet);
              onPaymentSuccess?.(actualPlanId, data, plan.usdPrice);
              clearPaymentSession();
              onClose();
              toast.success(`🎉 Payment successful! You now have ${plan.name}. Your subscription is active!`);
            } else {
              console.error('❌ Failed to record subscription:', recordResult.message);
              onPaymentSuccess?.(actualPlanId, data, plan.usdPrice);
              clearPaymentSession();
              onClose();
              toast.error(`⚠️ Payment successful but failed to activate subscription. Please contact support.`);
            }
          } catch (error) {
            console.error('❌ Error processing subscription:', error);
            onPaymentSuccess?.(planId, data, plan.usdPrice);
            clearPaymentSession();
            onClose();
            toast.error(`⚠️ Payment successful but there was an issue activating your subscription. Please contact support.`);
          } finally {
            setIsProcessing(false);
          }
        },
        onTransactionError: (error) => {
          console.error('❌ Transaction Error:', error);
          clearPaymentSession();
          setIsProcessing(false);
          toast.error('❌ Payment failed. Please try again.');
        },
        onWidgetClose: () => {
          console.log('🔒 Widget closed');
          clearPaymentSession();
          setIsProcessing(false);
          setCurrentStep(PaymentStep.PAYMENT_METHOD_SELECTION);
        },
      },
    });

    modal.updateRequestedAmountInUSD(plan.usdPrice);
    const usdcAmount = plan.usdPrice;
    modal.updateDestinationToken("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 8453, usdcAmount);
    modal.openModal();
  };

  if (!isOpen) return null;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case PaymentStep.PLAN_SELECTION:
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {PAYMENT_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-xl cursor-pointer transition-all duration-200 p-[1px]"
                style={{
                  background: plan.popular
                    ? 'linear-gradient(135deg, rgba(124,106,247,0.4), rgba(52,211,153,0.3))'
                    : 'rgba(255,255,255,0.06)',
                }}
                onClick={() => handlePlanSelection(plan.id)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = plan.popular
                    ? 'linear-gradient(135deg, rgba(124,106,247,0.6), rgba(52,211,153,0.4))'
                    : 'linear-gradient(135deg, rgba(124,106,247,0.3), rgba(124,106,247,0.1))';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = plan.popular
                    ? 'linear-gradient(135deg, rgba(124,106,247,0.4), rgba(52,211,153,0.3))'
                    : 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div className="rounded-xl p-6" style={{ background: '#0d1120' }}>
                  {plan.popular && (
                    <span
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        background: 'linear-gradient(135deg, #7c6af7, #34d399)',
                        color: '#fff',
                        letterSpacing: '0.08em',
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      MOST POPULAR
                    </span>
                  )}
                  {plan.badge && (
                    <span
                      className="absolute -top-3 right-4 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        background: 'rgba(124,106,247,0.15)',
                        border: '1px solid rgba(124,106,247,0.3)',
                        color: '#a78bfa',
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <p className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: '#64748b', fontFamily: "'DM Mono', monospace" }}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>${plan.usdPrice}</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>/ {plan.duration}</span>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-[12px]" style={{ color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full mt-6 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200"
                    style={{
                      background: plan.popular
                        ? 'linear-gradient(135deg, #7c6af7, #6d5ce7)'
                        : 'rgba(255,255,255,0.04)',
                      border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      color: plan.popular ? '#fff' : '#94a3b8',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={e => {
                      if (!plan.popular) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(124,106,247,0.12)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,106,247,0.3)';
                        (e.currentTarget as HTMLElement).style.color = '#a78bfa';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!plan.popular) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                      }
                    }}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case PaymentStep.EMAIL_INPUT:
        return (
          <div className="p-6 max-w-md mx-auto space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: ‘#64748b’, fontFamily: "’DM Mono’, monospace" }}>
                Email Verification
              </p>
              <p className="text-[12px]" style={{ color: ‘#94a3b8’ }}>
                We&apos;ll send you a one-time code to confirm your address before payment.
              </p>
            </div>
            <input
              type="email"
              placeholder="you@example.com"
              value={userInputEmail}
              onChange={e => setUserInputEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-[13px] text-white outline-none transition-all duration-200"
              style={{
                background: ‘rgba(255,255,255,0.03)’,
                border: ‘1px solid rgba(255,255,255,0.08)’,
                fontFamily: "’DM Sans’, sans-serif",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = ‘rgba(124,106,247,0.4)’; }}
              onBlur={e => { e.currentTarget.style.borderColor = ‘rgba(255,255,255,0.08)’; }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(PaymentStep.PLAN_SELECTION)}
                className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200"
                style={{
                  background: ‘rgba(255,255,255,0.04)’,
                  border: ‘1px solid rgba(255,255,255,0.08)’,
                  color: ‘#94a3b8’,
                }}
                disabled={isVerifyingEmail}
              >
                Back
              </button>
              <button
                onClick={handleEmailVerification}
                className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200 disabled:opacity-40"
                style={{
                  background: ‘linear-gradient(135deg, #7c6af7, #6d5ce7)’,
                  color: ‘#fff’,
                }}
                disabled={isVerifyingEmail}
              >
                {isVerifyingEmail ? ‘Sending...’ : ‘Send Magic Link’}
              </button>
            </div>
          </div>
        );

      case PaymentStep.TERMS_ACCEPTANCE:
        const selectedPlanData = PAYMENT_PLANS.find(p => p.id === selectedPlan);
        return (
          <div className="p-6 max-w-lg mx-auto">
            <div className="text-center mb-5">
              <p className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: '#64748b', fontFamily: "'DM Mono', monospace" }}>
                Terms & Conditions
              </p>
              <p className="text-[12px]" style={{ color: '#94a3b8' }}>
                {userEmail ? `Welcome back, ${userEmail}` : 'Please accept our terms to continue'}
              </p>
              {selectedPlanData && (
                <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: '#64748b', fontFamily: "'DM Mono', monospace" }}>{selectedPlanData.name}</p>
                  <p className="text-xl font-bold mt-1" style={{ color: '#34d399', fontFamily: "'DM Sans', sans-serif" }}>${selectedPlanData.usdPrice}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div
                className="p-4 rounded-lg max-h-96 overflow-y-auto whitespace-pre-line text-[11px]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', lineHeight: 1.6 }}
              >
                {`
Terms and Conditions
Last updated: July 10, 2025

By subscribing to the crypto news update and future prediction services offered by Aten Ventures Studio Pte. Ltd. ("we", "us", or "our"), you ("Subscriber") agree to be bound by the following terms and conditions ("Terms"). Please read them carefully. If you do not agree with any part of these Terms, you must not subscribe to or use our subscription services.

1. Subscription Services
We provide the following subscription-based services:
- Crypto News Updates: Curated, real-time news summaries and analyses of cryptocurrency markets.
- Future Prediction Reports: Expert-driven projections and forecasts on cryptocurrency price movements and market trends.

Your subscription grants you ongoing access to these services for the subscription term you select.

2. Subscription Plans and Fees
You may choose one of the following plans:

Plan          | Fee        | Billing Cycle
------------- | ---------- | -------------
Monthly Plan   | USD 6.9.00  | Billed monthly
Annual Plan    | USD 500.00 | Billed annually

All fees are exclusive of applicable taxes, which will be added at checkout.
Subscriptions automatically renew at the end of each billing cycle unless cancelled prior to the renewal date.
To cancel or change your plan, log into your account settings or contact support at legal@zkagi.ai.
Refunds are only provided at our discretion and subject to our Refund Policy.

3. Updates and Notifications
By subscribing, you agree to receive the following communications from us:
- Subscription Status Updates: Billing confirmations, renewal reminders, account changes, and other administrative notices.
- New Feature Announcements: Alerts about platform enhancements, new tools, and service improvements.
- Daily Reports: Daily summaries of relevant market data, news highlights, and predictive insights related to your subscription.

4. Promotional and Marketing Communications
You also consent to receive marketing and promotional emails, including information about:
- Special offers, discounts, or partner promotions
- Upcoming events or webinars
- Related products or services ("Promotional Content")

You may opt out of Promotional Content at any time by clicking the "unsubscribe" link in any such email or by contacting us at legal@zkagi.ai. This opt-out does not apply to transactional or administrative messages.

5. Consent to Electronic Communications
You agree that all communications, agreements, and notices ("Communications") may be provided electronically, including via email or by posting on our website. You consent to receive Communications electronically.

6. Privacy Policy
Your use of our services is governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. Please review it carefully.

7. Changes to Terms
We may modify these Terms at any time. We will update the "Last updated" date and notify you by email or in-app notification. Continued use after changes constitutes acceptance of the updated Terms.

8. Contact Information
Aten Ventures Studio Pte. Ltd.
200 Jalan Sultan, #11-01 Textile Centre
Singapore 199018
Email: legal@zkagi.ai

9. Governing Law
These Terms are governed by the laws of Singapore, without regard to its conflict of law principles.
`}
              </div>


              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  className="mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: termsAccepted ? '#7c6af7' : 'rgba(255,255,255,0.04)',
                    border: termsAccepted ? '1px solid #7c6af7' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {termsAccepted && (
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="sr-only" />
                <span className="text-[12px]" style={{ color: '#94a3b8' }}>
                  I agree to the Terms & Conditions and Privacy Policy
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={handleGoBack}
                  className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleTermsAcceptance}
                  disabled={!termsAccepted}
                  className="flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200 disabled:opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, #7c6af7, #6d5ce7)',
                    color: '#fff',
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        );

      case PaymentStep.PAYMENT_METHOD_SELECTION:
        return (
          <div className="p-6 max-w-lg mx-auto">
            <div className="text-center mb-5">
              <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: '#64748b', fontFamily: "'DM Mono', monospace" }}>
                Payment Method
              </p>
              <p className="text-[12px]" style={{ color: '#94a3b8' }}>Select how you&apos;d like to pay</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePaymentMethodSelection('solana')}
                className="w-full p-5 rounded-xl text-left transition-all duration-200 flex items-center gap-4"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(52,211,153,0.25)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.1)' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>Solana Pay</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>Pay with USDC on Solana</p>
                </div>
              </button>

              <button
                onClick={() => handlePaymentMethodSelection('stripe')}
                className="w-full p-5 rounded-xl text-left transition-all duration-200 flex items-center gap-4"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,106,247,0.25)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,106,247,0.1)' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>Credit Card</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>Stripe — card, Apple Pay, Google Pay</p>
                </div>
              </button>

              <button
                onClick={handleGoBack}
                className="w-full py-2.5 mt-2 rounded-lg text-[12px] font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                Back
              </button>
            </div>
          </div>
        );

      case PaymentStep.SOLANA_PAY_QR:
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-5">
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#64748b', fontFamily: "'DM Mono', monospace" }}>
              Scan with Solana Wallet
            </p>
            <div className="p-4 rounded-xl" style={{ background: '#fff' }}>
              <QRCode value={solanaPayURL} size={180} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGoBack}
                className="px-5 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                Back
              </button>
              <button
                onClick={handleCheckPayment}
                disabled={isChecking}
                className="px-5 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #34d399, #059669)',
                  color: '#fff',
                }}
              >
                {isChecking ? 'Checking...' : 'Verify Payment'}
              </button>
            </div>
          </div>
        );

        case PaymentStep.STRIPE_PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-5">
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(124,106,247,0.3)', borderTopColor: 'transparent', borderRightColor: '#7c6af7' }} />
            <p className="text-[13px] font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>Redirecting to Stripe</p>
            <p className="text-[11px] text-center" style={{ color: '#64748b' }}>
              You&apos;ll be redirected to our secure payment processor to complete your subscription.
            </p>
            <button
              onClick={handleGoBack}
              className="px-5 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        );

      default:
        return (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(124,106,247,0.3)', borderTopColor: 'transparent', borderRightColor: '#7c6af7' }} />
          </div>
        );
    }
  };

  const stepTitles: Record<string, string> = {
    [PaymentStep.PLAN_SELECTION]: 'Choose Your Plan',
    [PaymentStep.EMAIL_INPUT]: 'Email Verification',
    [PaymentStep.TERMS_ACCEPTANCE]: 'Terms & Conditions',
    [PaymentStep.PAYMENT_METHOD_SELECTION]: 'Payment Method',
    [PaymentStep.SOLANA_PAY_QR]: 'Solana Pay',
    [PaymentStep.STRIPE_PROCESSING]: 'Stripe Payment',
    [PaymentStep.AARC_PROCESSING]: 'Processing Payment',
  };

  // Step progress indicator
  const stepOrder = [
    PaymentStep.PLAN_SELECTION,
    PaymentStep.EMAIL_INPUT,
    PaymentStep.TERMS_ACCEPTANCE,
    PaymentStep.PAYMENT_METHOD_SELECTION,
  ];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="rounded-2xl w-full max-w-2xl mx-4 overflow-y-auto max-h-[90vh]"
        style={{
          background: '#0c1019',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,106,247,0.1)' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-[14px] font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {stepTitles[currentStep] || 'Payment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            <X className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
          </button>
        </div>

        {/* Step progress */}
        {currentStepIndex >= 0 && (
          <div className="px-6 pt-4 flex gap-1.5">
            {stepOrder.map((_, i) => (
              <div
                key={i}
                className="h-[2px] flex-1 rounded-full transition-all duration-300"
                style={{
                  background: i <= currentStepIndex ? '#7c6af7' : 'rgba(255,255,255,0.06)',
                }}
              />
            ))}
          </div>
        )}

        {/* Dynamic Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
}