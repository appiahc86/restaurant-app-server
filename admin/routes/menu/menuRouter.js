const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const menuController = require('../../controllers/menu/menuController');

//Get menuItems
router.get('/', auth, menuController.index);

//Save menu
router.post('/', auth, menuController.create);

//Edit menu
router.post('/edit', auth, menuController.edit);

//Delete menu
router.post('/delete', auth, menuController.destroy);


module.exports = router;