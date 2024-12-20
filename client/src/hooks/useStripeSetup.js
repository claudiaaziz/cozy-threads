import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getPublishableKey } from '../services/stripe';

export function useStripeSetup() {
	const [stripePromise, setStripePromise] = useState(null);

	useEffect(() => {
		const setupStripe = async () => {
			try {
				const publishableKey = await getPublishableKey();
				// Initialize Stripe here since we need to fetch the key first
				setStripePromise(loadStripe(publishableKey));
			} catch (error) {
				console.error('Error loading Stripe:', error);
			}
		};
		setupStripe();
	}, []);

	return stripePromise;
}
