const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const menuController = require('../../controllers/menu/menuController');
const isAdmin = require("../../middleware/isAdmin");


//Get menuItems
router.get('/', auth, isAdmin, menuController.index);

//Save menu
router.post('/', auth, isAdmin, menuController.create);

//Edit menu
router.post('/edit', auth, isAdmin, menuController.edit);

//Delete menu
router.post('/delete', auth, isAdmin, menuController.destroy);


module.exports = router;