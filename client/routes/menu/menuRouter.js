const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const menuController = require('../../controllers/menu/menuController');

//Get menuItems
router.get('/', menuController.index);


module.exports = router;