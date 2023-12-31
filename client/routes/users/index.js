const express = require("express");
const router = express.Router();

const userIndexController = require("../../controllers/users");
const auth = require("../../middleware/auth");

router.post("/update", auth, userIndexController.update);


module.exports = router;