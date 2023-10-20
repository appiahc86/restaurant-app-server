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

//cancel Order
router.post("/cancel", auth, ordersController.cancelOrder);

//Get delivering Orders
router.get("/delivering", auth, ordersController.delivering);

//Mark as delivered
router.post("/delivered", auth, ordersController.delivered);

module.exports = router;