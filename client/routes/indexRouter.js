const express = require("express");
const router = express.Router();
const config = require("../../config/config");

const indexController = require("../controllers/indexController");
const stripeWebHookController = require("../controllers/stripeWebHookController");
const auth = require("../middleware/auth");


//get zip code
router.post("/zipcode", indexController.getZipcode);

//Generate payment intent
router.post("/payment-intent", indexController.paymentIntent);

//Stripe webhook
router.post("/webhook/stripe", express.raw({type: 'application/json'}), stripeWebHookController.webhook);


module.exports = router;