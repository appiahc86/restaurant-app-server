const db = require("../../config/db");
const logger = require("../../winston");
const config = require("../../config/config")
const stripe = require('stripe')(`${config.STRIPE_SECRET_KEY}`);


// Match the raw body to content type application/json
// If you are using Express v4 - v4.16 you need to use body-parser, not express, to retrieve the request body
const endpointSecret = "whsec_19e897f8c10432835c1cd710e9166aa8afa656bda0eebfb58ba35435148a1ca4";
const stripeWebHookController = {

    webhook: async (request, response) => {

        const sig = request.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
            response.json({received: true}); //Return a response to acknowledge receipt of the event
            // Handle the event
            switch (event.type) {
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object;

                   await db("payments")
                       .where("extReference", paymentIntent.id)
                       .update({status: "successful"})
                    break;
                case 'payment_method.attached':
                    const paymentMethod = event.data.object;
                    console.log('PaymentMethod was attached to a Customer!');
                    break;
                // ... handle other event types
                default:
                    console.clear();
            }


        }
        catch (err) {
                 logger.error("Stripe webhook");
                 logger.error(err.message);
            response.status(400).send(`Webhook Error: ${err.message}`);
        }

    }


}

module.exports = stripeWebHookController;