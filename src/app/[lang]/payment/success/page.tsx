// // src/app/[lang]/payment/success/page.tsx
// 'use client'

// import { useEffect, useState } from 'react'
// import { useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import { CheckCircle, ArrowRight, Download } from 'lucide-react'

// interface SessionData {
//   sessionId: string
//   customerEmail: string
//   amountTotal: number
//   currency: string
//   paymentStatus: string
//   subscriptionId: string
// }

// export default function PaymentSuccessPage() {
//   const searchParams = useSearchParams()
//   const sessionId = searchParams.get('session_id')
//   const [sessionData, setSessionData] = useState<SessionData | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     if (sessionId) {
//       fetchSessionData(sessionId)
//     } else {
//       setError('No session ID found')
//       setLoading(false)
//     }
//   }, [sessionId])

//   const fetchSessionData = async (sessionId: string) => {
//     try {
//       // You might want to create an API endpoint to get session details
//       // For now, we'll just show success without detailed session info
//       setLoading(false)
//     } catch (error) {
//       console.error('Failed to fetch session data:', error)
//       setError('Failed to load payment details')
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
//           <p className="text-white mt-4">Loading payment details...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="max-w-md mx-auto text-center">
//           <div className="bg-red-600 rounded-full p-3 w-16 h-16 mx-auto mb-4">
//             <span className="text-white text-2xl">❌</span>
//           </div>
//           <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
//           <p className="text-gray-400 mb-6">{error}</p>
//           <Link 
//             href="/"
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center"
//           >
//             Return Home <ArrowRight className="ml-2 w-4 h-4" />
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
//       <div className="max-w-2xl mx-auto text-center">
//         {/* Success Icon */}
//         <div className="mb-8">
//           <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
//         </div>

//         {/* Success Message */}
//         <h1 className="text-4xl font-bold text-white mb-4">
//           🎉 Payment Successful!
//         </h1>
        
//         <p className="text-xl text-gray-300 mb-8">
//           Welcome to ZkTerminal Premium! Your subscription is now active.
//         </p>

//         {/* Session Details */}
//         {sessionId && (
//           <div className="bg-gray-800 rounded-lg p-6 mb-8 text-left">
//             <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
//             <div className="space-y-2 text-gray-300">
//               <p><span className="text-gray-400">Session ID:</span> {sessionId}</p>
//               <p><span className="text-gray-400">Status:</span> <span className="text-green-400">✅ Completed</span></p>
//               <p><span className="text-gray-400">Access:</span> <span className="text-blue-400">Premium features unlocked</span></p>
//             </div>
//           </div>
//         )}

//         {/* What's Next */}
//         <div className="bg-gray-800 rounded-lg p-6 mb-8">
//           <h3 className="text-lg font-semibold text-white mb-4">What&apos;s Next?</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
//             <div className="bg-gray-700 rounded-lg p-4">
//               <h4 className="text-white font-medium mb-2">📊 Premium Reports</h4>
//               <p className="text-gray-300 text-sm">Access advanced market predictions and analysis</p>
//             </div>
//             <div className="bg-gray-700 rounded-lg p-4">
//               <h4 className="text-white font-medium mb-2">📈 Trading Signals</h4>
//               <p className="text-gray-300 text-sm">Get real-time trading recommendations</p>
//             </div>
//             <div className="bg-gray-700 rounded-lg p-4">
//               <h4 className="text-white font-medium mb-2">💎 VIP Community</h4>
//               <p className="text-gray-300 text-sm">Join our exclusive Discord community</p>
//             </div>
//             <div className="bg-gray-700 rounded-lg p-4">
//               <h4 className="text-white font-medium mb-2">⭐ Priority Support</h4>
//               <p className="text-gray-300 text-sm">Get help from our premium support team</p>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <Link 
//             href="/"
//             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg inline-flex items-center justify-center font-semibold"
//           >
//             Explore Premium Features <ArrowRight className="ml-2 w-4 h-4" />
//           </Link>
          
//           <Link 
//             href="/predictions"
//             className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg inline-flex items-center justify-center font-semibold"
//           >
//             View Predictions <Download className="ml-2 w-4 h-4" />
//           </Link>
//         </div>

//         {/* Footer */}
//         <div className="mt-12 text-gray-500 text-sm">
//           <p>Questions? Contact us at support@zkagi.ai</p>
//           <p className="mt-2">
//             You can manage your subscription in your{' '}
//             <Link href="/account" className="text-blue-400 hover:text-blue-300">
//               account settings
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { Suspense } from 'react'
import PaymentSuccessContent from './PaymentSuccessContent'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dsBg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dsPurple/30 border-t-dsPurple rounded-full animate-spin mx-auto" />
          <p className="text-white mt-4">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}