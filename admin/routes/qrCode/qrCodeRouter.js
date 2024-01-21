const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const  isDeliveryPerson = require("../../middleware/isDeliveryPerson");
const qrCodeController = require("../../controllers/qrCode/qrCodeController");

router.post("/scan", auth, isDeliveryPerson, qrCodeController.scan);


module.exports = router;