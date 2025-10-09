import { NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bucket, agents, amountUsd, payer } = body;
    
    // Generate a unique reference for this payment
    const reference = Keypair.generate().publicKey.toString();
    
    // Log for debugging
    console.log('Creating agent reference:', {
      bucket,
      agents,
      amountUsd,
      payer,
      reference
    });
    
    // TODO: Store this in your database if needed
    // await db.paymentReferences.create({
    //   reference,
    //   bucket,
    //   agents,
    //   amountUsd,
    //   payer,
    //   status: 'pending',
    //   createdAt: new Date()
    // });
    
    return NextResponse.json({ reference });
  } catch (error) {
    console.error('Error creating agent reference:', error);
    return NextResponse.json(
      { error: 'Failed to create reference' },
      { status: 500 }
    );
  }
}