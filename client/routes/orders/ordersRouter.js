const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const authOrGuest = require("../../middleware/authOrGuest");
const ordersController = require('../../controllers/orders/ordersController');

//get Orders
router.get('/', auth, ordersController.index);

//Save Order
router.post('/', authOrGuest, ordersController.create);

//View OrderDetails
router.get('/details', auth, ordersController.viewDetails);

//Delete order
router.post('/destroy', ordersController.destroy);

//Capture Order
router.post('/capture/:orderID', authOrGuest, ordersController.capture);


module.exports = router;