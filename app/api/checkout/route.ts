import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({ session });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { priceId, limit } = body;

    if (!priceId || !limit) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin');
    if (!origin) {
      return NextResponse.json(
        { error: 'Missing origin header' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?success=true&limit=${limit}`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      metadata: {
        limit: limit.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe API error:', err);
    return NextResponse.json(
      { 
        error: err.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err : undefined
      },
      { status: err.statusCode || 500 }
    );
  }
}