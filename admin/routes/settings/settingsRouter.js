const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const settingsController = require('../../controllers/settings/settingsController');
const isUser = require("../../middleware/isUser");

//Get settings
router.get("/", settingsController.index);

//Close or open orders
router.post("/", auth, isUser, settingsController.toggleAllowOrders);

module.exports = router;