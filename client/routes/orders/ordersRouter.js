const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const ordersController = require('../../controllers/orders/ordersController');

//get Orders
router.get('/', auth, ordersController.index);
//Save Order
router.post('/', auth, ordersController.create);
//View OrderDetails
router.get('/details', auth, ordersController.viewDetails);
//Delete order
router.post('/destroy', auth, ordersController.destroy);

//Capture Order
router.post('/capture/:orderID', auth, ordersController.capture);


module.exports = router;