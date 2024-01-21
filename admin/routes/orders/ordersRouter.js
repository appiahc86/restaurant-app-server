const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const ordersController = require('../../controllers/orders/ordersController');

//Get today's orders
router.get("/", auth, ordersController.index);

//get order details
router.post("/details", auth, ordersController.details);

//send Order
router.post("/send", auth, ordersController.sendOrder);

//Get delivering Orders
router.get("/delivering", auth, ordersController.delivering);


module.exports = router;