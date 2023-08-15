const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const menuController = require('../../controllers/menu/menuController');

//Get menuItems
router.get('/', menuController.index);

//Save Category
router.post('/', menuController.create);

//Edit category
router.post('/edit', menuController.edit);

//Delete Category
router.post('/delete', menuController.destroy);


module.exports = router;