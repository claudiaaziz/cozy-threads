import { useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import CheckoutForm from './CheckoutForm';
import StripeWrapper from './StripeWrapper';
import '../styles/ShoppingCart.css';
import { useStripeSetup } from '../hooks/useStripeSetup';
import { createPaymentIntent, updatePaymentIntent } from '../services/stripe';
import { formatPrice } from '../utils/formatters';

export default function ShoppingCart({ onClose }) {
	const { cartItems, removeItemFromCart, paymentIntentId, setPaymentIntentId, clientSecret, setClientSecret } =
		useContext(CartContext);
	const stripePromise = useStripeSetup();

	const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

	useEffect(() => {
		// Create/Update PaymentIntent
		if (totalPrice > 0) {
			const cartItemsToSend = cartItems.map((item) => ({
				id: item.id,
				quantity: item.quantity,
			}));

			const managePayment = async () => {
				try {
					if (!paymentIntentId) {
						// Create PaymentIntent
						const { clientSecret, paymentIntentId: newId } = await createPaymentIntent(cartItemsToSend);
						setClientSecret(clientSecret);
						setPaymentIntentId(newId);
						// console.log('ShoppingCart 🩷 PaymentIntentId created. This should only be hit once', newId);
					} else {
						// Update PaymentIntent
						await updatePaymentIntent(cartItemsToSend, paymentIntentId);
						// console.log(
						// 	'updatePaymentIntent 🧚🏻‍♀️ cartItemsToSend:',
						// 	cartItemsToSend,
						// 	'paymentIntentId:',
						// 	paymentIntentId
						// );
					}
				} catch (error) {
					console.error('Error managing payment:', error);
				}
			};

			managePayment();
		}
	}, [cartItems]);

	if (!stripePromise) {
		// Loading Spinner
		return;
	}

	return (
		<div className='cart-preview'>
			<div className='cart-preview-header'>
				<h3>Your Cart</h3>
				<button onClick={onClose} className='close-btn'>
					&times;
				</button>
			</div>

			{cartItems.length === 0 ? (
				<div className='empty-cart'>
					<h4>Your cart is empty</h4>
					<p>Add some items to get started!</p>
				</div>
			) : (
				<>
					<div className='cart-items'>
						{cartItems.map((item) => (
							<div key={item.id} className='cart-item'>
								<img src={item.image} alt={item.name} />
								<div className='cart-item-details'>
									<div className='cart-item-header'>
										<h4>{item.name}</h4>
										<button onClick={() => removeItemFromCart(item.id)} className='remove-item-btn'>
											&times;
										</button>
									</div>
									<p>Quantity: {item.quantity}</p>
									<p>${formatPrice(item.price * item.quantity)}</p>
								</div>
							</div>
						))}
					</div>

					<div className='cart-preview-footer'>
						<div className='cart-total'>
							<strong>Total: ${formatPrice(totalPrice)}</strong>
						</div>
						{clientSecret && (
							<StripeWrapper clientSecret={clientSecret}>
								<CheckoutForm />
							</StripeWrapper>
						)}
					</div>
				</>
			)}
		</div>
	);
}
