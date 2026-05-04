
const launchStripeCheckout = async () => {
    try {
        // 1. Call your backend endpoint
        const response = await fetch('/purchase-game/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        console.log(data);

        // 2. Redirect to Stripe Checkout
        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error('No checkout URL returned');
        }
    } catch (error) {
        console.error('Error initiating checkout:', error);
    }
};
