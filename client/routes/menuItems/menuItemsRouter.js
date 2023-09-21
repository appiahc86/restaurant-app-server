const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const menuItemsController = require('../../controllers/menuItems/MenuItemsController');

//Get menuItems
router.get('/', menuItemsController.index);


module.exports = router;