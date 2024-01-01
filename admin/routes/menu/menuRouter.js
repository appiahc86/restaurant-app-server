const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const menuController = require('../../controllers/menu/menuController');

//Get menuItems
router.get('/', menuController.index);

//Save menu
router.post('/', menuController.create);

//Edit menu
router.post('/edit', menuController.edit);

//Delete menu
router.post('/delete', menuController.destroy);


module.exports = router;