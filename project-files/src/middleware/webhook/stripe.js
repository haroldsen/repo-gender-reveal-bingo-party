
import Stripe from 'stripe';

import { createGameForUserId } from "../../models/games/games.js";

const stripeKey = process.env.NODE_ENV.includes('dev')
    ? process.env.STRIPE_TEST_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY;

const stripeWebhookSecret = process.env.NODE_ENV.includes('dev')
    ? process.env.STRIPE_TEST_WEBHOOK_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(stripeKey);

export const handleStripeWebhook = async (req, res) => {

    // CLI command: stripe listen --forward-to http://127.0.0.1:3000/webhook
    console.log('\nReceived POST request from Stripe!');

    console.log("  Headers: ", JSON.stringify(req.headers));
    console.log("  Body Type: ", req.body instanceof Buffer ? "Buffer (Correct body type)" : `${typeof req.body} (WRONG BODY TYPE)`);
    console.log("  Secret used: ", stripeWebhookSecret?.substring(0, 10));

    const sig = req.headers['stripe-signature'];
    let event;

    // 1. Verify the request is actually from Stripe
    try {

        const payload = req.body;

        if (!payload || (Buffer.isBuffer(payload) === false && typeof payload !== 'string')) {
            throw new Error('Raw body not found. Check your middleware configuration in server.js.');
        }

        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            stripeWebhookSecret
        );
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        // Log this specifically to see if it's a "No raw body" issue or a "Wrong Secret" issue
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. Handle the specific event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const userId = session.metadata.userId;
            const sessionId = session.id;

            console.log(`  Processing fulfillment for user ID: ${userId}...`);

            try {
                await createGameForUserId(userId, sessionId);
                console.log('  Game created successfully in database!');
            } catch (dbError) {
                console.error('  Database insertion failed:', dbError);
                // Return a 500 so Stripe knows to retry this specific event later
                return res.status(500).send('  Internal Server Error');
            }
            break;

        default:
            console.log(`  Unhandled event type ${event.type}`);
    }

    // 4. Always respond with a 200 to acknowledge receipt
    res.status(200).json({ received: true });
};
