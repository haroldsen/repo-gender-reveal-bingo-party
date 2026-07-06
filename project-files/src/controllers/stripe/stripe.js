
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

        // req.session.user is guaranteed to exist because of the 'requireLogin' middleware
        const userId = req.session.user.id; 
        
        // TODO: Fix the cancel url so it's dynamic.
        //       We want to redirect the user to where they came from.
        //       Here's the catch: if a user clicks on "Purchase Game" while they aren't
        //       logged in, the user will have technically come from the "Login" page.
        //       We don't want that.
        //       We want to redirect the user to where they clicked "Purchase Game",
        //       NOT their target destination stored from the requireLogin function.
        const cancelUrl = `${baseURL}/my-games`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: `${baseURL}/purchase-game/purchase-confirmation`,
            cancel_url: cancelUrl,
            metadata: { userId },
            billing_address_collection: 'required',
            automatic_tax: { enabled: true }
        });

        // 303 See Other is the recommended HTTP status code for web redirection after a request
        res.redirect(303, session.url);

    } catch (error) {
        console.error('Stripe session creation failed:', error);
        
        // Use flash memory to warn the user, then bounce them back safely
        req.flash('error', 'Could not initiate payment. Please try again.');
        res.redirect('/my-games');
    }
};

const purchaseConfirmationPage = async (req, res, next) => {
    res.render('purchase/purchase-confirmation', {
        title: 'Purchase Confirmation | Gender Reveal Bingo Party',
        mainClass: 'purchase-confirmation'
    });
}

// Map the functions to the routes
router.get('/checkout', requireLogin, handleCreateCheckout);
router.get('/purchase-confirmation', requireLogin, purchaseConfirmationPage);

export default router;
