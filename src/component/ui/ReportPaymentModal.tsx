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
    name: 'Monthly Subscription',
    usdPrice: 6.9,
    duration: '1 month',
    features: [
      '📊 All premium prediction reports',
      '📈 Advanced market analysis',
      '🎯 Trading signals',
      '📱 Unlimited access',
    ],
    color: 'blue',
  },
  {
    id: 'yearly',
    name: 'Yearly Subscription',
    usdPrice: 500,
    duration: '12 months',
    features: [
      '📊 All premium prediction reports',
      '📈 Advanced market analysis',
      '🎯 Trading signals',
      '⭐ Priority support',
      '💎 VIP community access',
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
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {PAYMENT_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border-2 transform hover:scale-105 transition cursor-pointer ${plan.color === 'orange' ? 'border-orange-500' :
                  plan.color === 'green' ? 'border-green-500' : 'border-blue-500'
                  }`}
                onClick={() => handlePlanSelection(plan.id)}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    🔥 MOST POPULAR
                  </span>
                )}
                {plan.badge && (
                  <span className="absolute -top-3 right-3 bg-orange-600 text-white px-2 py-1 rounded-full text-xs">
                    {plan.badge}
                  </span>
                )}

                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-extrabold mb-1 text-white">${plan.usdPrice}</div>
                <p className="text-sm text-gray-400 mb-4">{plan.duration}</p>

                <ul className="text-gray-300 mb-4 space-y-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className={`w-full py-2 rounded-lg font-semibold text-center ${plan.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                  plan.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                    'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  }`}>
                  Select Plan
                </div>
              </div>
            ))}
          </div>
        );

      case PaymentStep.EMAIL_INPUT:
        return (
          <div className="p-6 max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold text-white">Enter your Email</h3>
            <p className="text-gray-400 text-sm">
              We’ll send you a one-time link to confirm your address before you pay.
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              value={userInputEmail}
              onChange={e => setUserInputEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep(PaymentStep.PLAN_SELECTION)}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                disabled={isVerifyingEmail}
              >
                Back
              </button>
              <button
                onClick={handleEmailVerification}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                disabled={isVerifyingEmail}
              >
                {isVerifyingEmail ? 'Sending…' : 'Send Magic Link'}
              </button>
            </div>
          </div>
        );

      case PaymentStep.TERMS_ACCEPTANCE:
        const selectedPlanData = PAYMENT_PLANS.find(p => p.id === selectedPlan);
        return (
          <div className="p-6 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Terms & Conditions</h3>
              <p className="text-gray-400">
                {userEmail ? `Welcome back, ${userEmail}!` : 'Please accept our terms to continue'}
              </p>
              {selectedPlanData && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <p className="text-white font-semibold">{selectedPlanData.name}</p>
                  <p className="text-2xl font-bold text-green-400">${selectedPlanData.usdPrice}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* <div className="bg-gray-800 p-4 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-gray-300 text-sm">
                  By proceeding with this purchase, you agree to our Terms of Service and Privacy Policy.
                  Your subscription will auto-renew unless cancelled. You can cancel anytime from your account settings.
                  All payments are processed securely through our payment partners.
                </p>
              </div> */}

              <div
                className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto whitespace-pre-line text-gray-300 text-sm"
                style={{ lineHeight: 1.5 }}
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


              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-300 text-sm">
                  I agree to the Terms & Conditions and Privacy Policy
                </span>
              </label>

              <div className="flex space-x-3">
                <button
                  onClick={handleGoBack}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleTermsAcceptance}
                  disabled={!termsAccepted}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
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
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Choose Payment Method</h3>
              <p className="text-gray-400">Select how you&apos;d like to pay</p>
            </div>

            <div className="space-y-4">
              {/* <button
                onClick={() => handlePaymentMethodSelection('aarc')}
                className="w-full p-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg border-2 border-transparent hover:border-purple-400 transition-all"
              >
                <div className="text-lg font-bold mb-2">💳 AARC (Ethereum)</div>
                <div className="text-sm opacity-90">Pay with any Ethereum wallet or card</div>
              </button> */}

              <button
                onClick={() => handlePaymentMethodSelection('solana')}
                className="w-full p-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg border-2 border-transparent hover:border-green-400 transition-all"
              >
                <div className="text-lg font-bold mb-2">⚡ Solana Pay</div>
                <div className="text-sm opacity-90">Pay with USDC on Solana</div>
              </button>

              <button
                onClick={() => handlePaymentMethodSelection('stripe')}
                className="w-full p-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg border-2 border-transparent hover:border-indigo-400 transition-all"
              >
                <div className="text-lg font-bold mb-2">💳 Stripe (Credit Card)</div>
                <div className="text-sm opacity-90">Pay with credit card, Apple Pay, Google Pay</div>
              </button>

              <button
                onClick={handleGoBack}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
              >
                Back
              </button>
            </div>
          </div>
        );

      case PaymentStep.SOLANA_PAY_QR:
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <h3 className="text-white text-lg font-medium">Scan with your Solana wallet</h3>
            <div className="bg-white p-4 rounded-lg">
              <QRCode value={solanaPayURL} size={200} />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleGoBack}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full"
              >
                Back
              </button>
              <button
                onClick={handleCheckPayment}
                disabled={isChecking}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full disabled:opacity-50"
              >
                {isChecking ? 'Checking...' : 'Done'}
              </button>
            </div>
          </div>
        );

        case PaymentStep.STRIPE_PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <h3 className="text-white text-lg font-medium">Redirecting to Stripe...</h3>
            <p className="text-gray-400 text-center">
              You&apos;ll be redirected to our secure payment processor to complete your subscription.
            </p>
            <button
              onClick={handleGoBack}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full"
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        );

      default:
        return <div className="p-6 text-white text-center">Loading...</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {currentStep === PaymentStep.PLAN_SELECTION ? '🚀 Choose Your Plan' :
              currentStep === PaymentStep.TERMS_ACCEPTANCE ? '📋 Terms & Conditions' :
                currentStep === PaymentStep.PAYMENT_METHOD_SELECTION ? '💳 Payment Method' :
                  currentStep === PaymentStep.SOLANA_PAY_QR ? '⚡ Solana Pay' :
                  currentStep === PaymentStep.STRIPE_PROCESSING ? '💳 Stripe Payment':
                    '💳 Processing Payment'}
          </h2>
          <button onClick={onClose} disabled={isProcessing}>
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Dynamic Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
}