// store/subscriptionStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { verifySubscription, VerificationResponse } from '@/lib/subscriptionApi';

interface SubscriptionState {
    isSubscribed: boolean;
    subscriptionType: string | null;
    expiresAt: string | null;
    createdAt: string | null;
    walletAddress: string | null;
    isLoading: boolean;
    lastChecked: number | null;

    // Payment session data
    currentPlanId: string | null;
    currentUserWallet: string | null;

    // Actions
    setSubscriptionStatus: (data: VerificationResponse & { walletAddress: string }) => void;
    checkSubscription: (walletAddress: string) => Promise<void>;
    clearSubscription: () => void;
    setLoading: (loading: boolean) => void;

    // Payment session actions
    setPaymentSession: (planId: string, userWallet: string) => void;
    clearPaymentSession: () => void;
    getPaymentSession: () => { planId: string | null; userWallet: string | null };
}

export const useSubscriptionStore = create<SubscriptionState>()(
    persist(
        (set, get) => ({
            isSubscribed: false,
            subscriptionType: null,
            expiresAt: null,
            createdAt: null,
            walletAddress: null,
            isLoading: false,
            lastChecked: null,

            // Payment session data
            currentPlanId: null,
            currentUserWallet: null,

            setSubscriptionStatus: (data) => {
                console.log('📱 Setting subscription status:', data);
                set({
                    isSubscribed: data.success,
                    subscriptionType: data.subscription_type || null,
                    expiresAt: data.expiresAt || null,
                    createdAt: data.createdAt || null,
                    walletAddress: data.walletAddress,
                    lastChecked: Date.now(),
                    isLoading: false,
                });
            },

            checkSubscription: async (walletAddress: string) => {
                const state = get();

                // Skip if already checking or recently checked (within 5 minutes)
                if (state.isLoading ||
                    (state.lastChecked &&
                        state.walletAddress === walletAddress &&
                        Date.now() - state.lastChecked < 5 * 60 * 1000)) {
                    return;
                }

                console.log('🔍 Checking subscription for wallet:', walletAddress);
                set({ isLoading: true });

                try {
                    const result = await verifySubscription(walletAddress);

                    console.log('subscription result', result)

                    get().setSubscriptionStatus({
                        ...result,
                        walletAddress,
                    });
                } catch {
                    // API may be unreachable on localhost
                    set({ isLoading: false });
                }
            },

            clearSubscription: () => {
                console.log('🧹 Clearing subscription state');
                set({
                    isSubscribed: false,
                    subscriptionType: null,
                    expiresAt: null,
                    createdAt: null,
                    walletAddress: null,
                    lastChecked: null,
                    isLoading: false,
                    // Don't clear payment session data here as it might be needed
                });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            // Payment session management
            setPaymentSession: (planId: string, userWallet: string) => {
                console.log('💳 Setting payment session:', { planId, userWallet });
                set({
                    currentPlanId: planId,
                    currentUserWallet: userWallet,
                });
            },

            clearPaymentSession: () => {
                console.log('🧹 Clearing payment session');
                set({
                    currentPlanId: null,
                    currentUserWallet: null,
                });
            },

            getPaymentSession: () => {
                const state = get();
                return {
                    planId: state.currentPlanId,
                    userWallet: state.currentUserWallet,
                };
            },
        }),
        {
            name: 'subscription-storage',
            // Only persist non-sensitive data
            partialize: (state) => ({
                isSubscribed: state.isSubscribed,
                subscriptionType: state.subscriptionType,
                expiresAt: state.expiresAt,
                createdAt: state.createdAt,
                walletAddress: state.walletAddress,
                lastChecked: state.lastChecked,
                // Don't persist payment session data for security
            }),
        }
    )
);