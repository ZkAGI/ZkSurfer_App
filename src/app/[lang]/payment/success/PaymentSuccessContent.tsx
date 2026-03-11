// src/app/[lang]/payment/success/PaymentSuccessContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, TrendingUp, BarChart2, Users, HeadphonesIcon, AlertCircle } from 'lucide-react'

interface SessionData {
  sessionId: string
  customerEmail: string
  amountTotal: number
  currency: string
  paymentStatus: string
  subscriptionId: string
}

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const lang = params.lang as string || 'en'
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionId) {
      // Simulate loading
      setTimeout(() => setLoading(false), 1000)
    } else {
      setError('No session ID found')
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-dsBg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dsPurple/30 border-t-dsPurple rounded-full animate-spin mx-auto" />
          <p className="text-white mt-4">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dsBg flex items-center justify-center p-4">
        <div className="ds-card max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20
                          flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="ds-heading-md mb-2">Something went wrong</h1>
          <p className="ds-body mb-6">{error}</p>
          <Link
            href={`/${lang}/home`}
            className="ds-btn-primary inline-flex"
          >
            Return Home <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dsBg flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 rounded-3xl bg-dsGreen/10 border border-dsGreen/20
                          flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-dsGreen" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="ds-heading-lg mb-4">
          Payment Successful!
        </h1>

        <p className="ds-body text-lg mb-8">
          Welcome to ZkTerminal Premium! Your subscription is now active.
        </p>

        {/* Session Details */}
        {sessionId && (
          <div className="ds-card mb-8 text-left border-dsGreen/20">
            <h3 className="ds-heading-sm mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-dsBorder/50">
                <span className="text-dsMuted">Session ID</span>
                <code className="text-sm text-white font-dmMono">{sessionId.slice(0, 20)}...</code>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dsBorder/50">
                <span className="text-dsMuted">Status</span>
                <span className="ds-badge-new">Completed</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-dsMuted">Access</span>
                <span className="ds-badge-popular">Premium Unlocked</span>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="ds-card mb-8">
          <h3 className="ds-heading-sm mb-6">What&apos;s Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-dsBg border border-dsBorder hover:border-dsPurple/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-dsPurple/15 flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5 text-dsPurple-light" />
              </div>
              <h4 className="text-white font-medium mb-1">Premium Reports</h4>
              <p className="ds-body text-sm">Access advanced market predictions and analysis</p>
            </div>
            <div className="p-4 rounded-xl bg-dsBg border border-dsBorder hover:border-dsGreen/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-dsGreen/15 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-dsGreen" />
              </div>
              <h4 className="text-white font-medium mb-1">Trading Signals</h4>
              <p className="ds-body text-sm">Get real-time trading recommendations</p>
            </div>
            <div className="p-4 rounded-xl bg-dsBg border border-dsBorder hover:border-blue-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="text-white font-medium mb-1">VIP Community</h4>
              <p className="ds-body text-sm">Join our exclusive Discord community</p>
            </div>
            <div className="p-4 rounded-xl bg-dsBg border border-dsBorder hover:border-amber-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3">
                <HeadphonesIcon className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="text-white font-medium mb-1">Priority Support</h4>
              <p className="ds-body text-sm">Get help from our premium support team</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${lang}/home`}
            className="ds-btn-primary"
          >
            Explore Premium Features <ArrowRight className="ml-2 w-4 h-4" />
          </Link>

          <Link
            href={`/${lang}/predictions`}
            className="ds-btn-secondary"
          >
            <TrendingUp className="w-4 h-4" />
            View Predictions
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-dsMuted text-sm">
          <p>Questions? Contact us at <a href="mailto:support@zkagi.ai" className="ds-link">support@zkagi.ai</a></p>
        </div>
      </div>
    </div>
  )
}
