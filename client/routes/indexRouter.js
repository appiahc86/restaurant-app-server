const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");
const auth = require("../middleware/auth");

//get zip code
router.post("/zipcode", indexController.getZipcode);

//Generate payment intent
router.post("/payment-intent", auth, indexController.paymentIntent);


module.exports = router;