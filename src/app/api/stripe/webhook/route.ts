// // pages/api/stripe/webhook.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import Stripe from 'stripe'
// import { buffer } from 'micro'
// import { recordSubscription, getSubscriptionType, RecordSubscriptionPayload } from '@/lib/subscriptionApi'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// })

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' })
//   }

//   const buf = await buffer(req)
//   const sig = req.headers['stripe-signature']!

//   let event: Stripe.Event

//   try {
//     event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
//   } catch (err) {
//     console.error('Webhook signature verification failed:', err)
//     return res.status(400).json({ message: 'Webhook signature verification failed' })
//   }

//   try {
//     switch (event.type) {
//       case 'checkout.session.completed':
//         await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
//         break
      
//       case 'invoice.payment_succeeded':
//         await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
//         break
      
//       case 'customer.subscription.deleted':
//         await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
//         break

//       default:
//         console.log(`Unhandled event type: ${event.type}`)
//     }

//     res.status(200).json({ received: true })
//   } catch (error) {
//     console.error('Error processing webhook:', error)
//     res.status(500).json({ message: 'Webhook processing failed' })
//   }
// }

// async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
//   console.log('✅ Checkout completed:', session.id)
  
//   const { walletAddress, planId } = session.metadata!
  
//   if (!walletAddress || !planId) {
//     throw new Error('Missing metadata in checkout session')
//   }

//   // Record the subscription
//   const subscriptionData: RecordSubscriptionPayload = {
//     walletAddress,
//     email: session.customer_email!,
//     subscription_type: getSubscriptionType(planId),
//     createdAt: new Date(session.created * 1000).toISOString(),
//     relayerTransactionId: '',
//     requestId: session.id,
//     depositAddress: '',
//     transactionHash: session.payment_intent as string || '',
//     transactionStatus: 'COMPLETED',
//     stripeSessionId: session.id,
//     stripeSubscriptionId: session.subscription as string,
//   }

//   const recordResult = await recordSubscription(subscriptionData)
  
//   if (!recordResult.success) {
//     console.error('❌ Failed to record Stripe subscription:', recordResult.message)
//     throw new Error('Failed to record subscription')
//   }
  
//   console.log('✅ Stripe subscription recorded successfully')
// }

// async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
//   console.log('💰 Payment succeeded for invoice:', invoice.id)
//   // Handle recurring payments if needed
// }

// async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
//   console.log('❌ Subscription canceled:', subscription.id)
//   // Handle subscription cancellation if needed
// }

// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { recordSubscription, getSubscriptionType, RecordSubscriptionPayload } from '@/lib/subscriptionApi'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return NextResponse.json(
        { message: 'No signature provided' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json(
        { message: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log(`✅ Received webhook: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`🔔 Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return NextResponse.json(
      { message: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Processing completed checkout:', session.id)
  
  const { walletAddress, planId } = session.metadata!
  
  if (!walletAddress || !planId) {
    throw new Error('Missing metadata in checkout session')
  }

  // Record the subscription
  const subscriptionData: RecordSubscriptionPayload = {
    walletAddress,
    email: session.customer_email!,
    subscription_type: getSubscriptionType(planId),
    createdAt: new Date(session.created * 1000).toISOString(),
    relayerTransactionId: '',
    requestId: session.id,
    depositAddress: '',
    transactionHash: session.payment_intent as string || '',
    transactionStatus: 'COMPLETED',
    stripeSessionId: session.id,
    stripeSubscriptionId: session.subscription as string,
    paymentMethod: 'stripe',
  }

  const recordResult = await recordSubscription(subscriptionData)
  
  if (!recordResult.success) {
    console.error('❌ Failed to record Stripe subscription:', recordResult.message)
    throw new Error('Failed to record subscription')
  }
  
  console.log('✅ Stripe subscription recorded successfully')
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Payment succeeded for invoice:', invoice.id)
  // Handle recurring payments if needed
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log('❌ Subscription canceled:', subscription.id)
  // Handle subscription cancellation if needed
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Webhook endpoint is active. Use POST for Stripe events.' },
    { status: 200 }
  )
}