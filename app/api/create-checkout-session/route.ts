import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buffer } from 'micro'; // Required to handle raw webhook body
import { updateUserCredits } from '/user.ts'; // Import the function to update user credits

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// This function creates a payment session for Stripe
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

// Configuration to ensure Stripe receives raw body for webhook verification
export const config = {
  api: {
    bodyParser: false, // Disable body parsing for webhooks
  },
};

// Webhook handler to process Stripe events
export async function stripeWebhook(request: Request) {
  const sig = request.headers.get('stripe-signature');
  
  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event;

  try {
    const buf = await buffer(request); // Stripe requires raw request body
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the checkout.session.completed event to update credits
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const limit = session.metadata?.limit; // Extract the credit limit from metadata
    const customerEmail = session.customer_details?.email; // Assuming email is used to identify users

    if (limit && customerEmail) {
      try {
        // Update the user's credits based on the limit provided
        await updateUserCredits(customerEmail, parseInt(limit));
        console.log(`Credits updated for user: ${customerEmail}`);
      } catch (error) {
        console.error('Error updating credits:', error);
        return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
