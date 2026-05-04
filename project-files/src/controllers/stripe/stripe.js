
import { requireLogin } from "../../middleware/auth.js";

import express from 'express';
import Stripe from 'stripe';

const stripeKey = process.env.NODE_ENV.includes('dev')
    ? process.env.STRIPE_TEST_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY;

const priceId = process.env.NODE_ENV.includes('dev')
    ? process.env.STRIPE_TEST_PRICE_ID
    : process.env.STRIPE_PRICE_ID;

const baseURL = process.env.BASE_URL;

const stripe = new Stripe(stripeKey);

const router = express.Router();

// Logic: Create Checkout Session
export const handleCreateCheckout = async (req, res) => {

    console.log('\nCreating Stripe checkout session!');

    try {
        const userId = req.session.user.id;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: `${baseURL}/purchase-game/purchase-confirmation`,
            cancel_url: `${baseURL}/my-games`,
            metadata: { userId }
        });
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const purchaseConfirmationPage = async (req, res, next) => {
    res.render('purchase/purchase-confirmation', {
        title: 'Purchase Confirmation | Gender Reveal Bingo Party'
    });
}

// Map the functions to the routes
router.post('/create-checkout-session', requireLogin, express.json(), handleCreateCheckout);
router.get('/purchase-confirmation', requireLogin, purchaseConfirmationPage);

export default router;
