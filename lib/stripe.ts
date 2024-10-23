import { loadStripe, Stripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutSession {
  id: string;
}

export async function createCheckoutSession(priceId: string, limit: number): Promise<CheckoutSession> {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, limit }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    
    if (!data.sessionId) {
      throw new Error('Invalid response from server');
    }

    return { id: data.sessionId };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to initiate payment. Please try again later.');
  }
}