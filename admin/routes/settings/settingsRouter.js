const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const settingsController = require('../../controllers/settings/settingsController');

//Get settings
router.get("/", settingsController.index);

//Close or open orders
router.post("/", settingsController.toggleAllowOrders);

module.exports = router;