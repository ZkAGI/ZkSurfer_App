// app/payment-failure/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentFailurePage() {
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string || 'en';

    return (
        <div className="min-h-screen bg-dsBg flex items-center justify-center p-4">
            <div className="ds-card max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20
                                flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                </div>

                {/* Title */}
                <h1 className="ds-heading-lg mb-3">Payment Failed</h1>

                {/* Description */}
                <p className="ds-body mb-8">
                    Something went wrong and your payment couldn&apos;t be processed.
                    Please try again or contact support if the issue persists.
                </p>

                {/* Info Box */}
                <div className="ds-alert-error text-left mb-8">
                    <p className="text-sm">
                        No charges were made to your account. You can safely retry the payment.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => router.push(`/${lang}/home`)}
                        className="ds-btn-ghost flex-1"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="ds-btn-primary flex-1"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>

                {/* Support Link */}
                <p className="text-xs text-dsMuted mt-8">
                    Need help?{' '}
                    <a href="mailto:support@zkagi.ai" className="ds-link">
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    );
}
