const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const menuItemsController = require('../../controllers/menuItems/menuItemsController');

//Gel all Menu
router.get('/getMenu', auth, menuItemsController.getMenu);

//Get all menuItems items
router.get('/', auth, menuItemsController.index);

//Save menuItem
router.post('/create', auth, menuItemsController.create);

//Edit menu item
router.post('/edit', auth, menuItemsController.edit);

//View details
router.post('/viewDetails', auth, menuItemsController.viewDetails);

//query one Item
router.post('/view', auth, menuItemsController.view);

//delete menu item
router.post('/delete', auth, menuItemsController.destroy);



module.exports = router;