const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const ordersController = require('../../controllers/orders/ordersController');

//Gel today's orders
router.get('/', ordersController.index);


module.exports = router;