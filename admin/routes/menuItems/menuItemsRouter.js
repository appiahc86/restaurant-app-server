const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const menuItemsController = require('../../controllers/menuItems/menuItemsController');

//Gel all Menu
router.get('/getMenu', menuItemsController.getMenu);

//Get all menuItems items
router.get('/', menuItemsController.index);

//Save menuItem
router.post('/create', menuItemsController.create);

//Edit menu item
router.post('/edit', menuItemsController.edit);

//View details
router.post('/viewDetails', menuItemsController.viewDetails);

//query one Item
router.post('/view', menuItemsController.view);

//delete menu item
router.post('/delete', menuItemsController.destroy);



module.exports = router;