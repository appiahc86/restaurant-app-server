const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const ordersController = require('../../controllers/orders/ordersController');
const isUser = require("../../middleware/isUser");

//Get today's orders
router.get("/", auth, isUser, ordersController.index);

//get order details
router.post("/details", auth, isUser, ordersController.details);

//send Order
router.post("/send", auth, isUser, ordersController.sendOrder);

//Get delivering Orders
router.get("/delivering", auth, isUser, ordersController.delivering);


module.exports = router;