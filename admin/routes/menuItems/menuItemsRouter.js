const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const menuItemsController = require('../../controllers/menuItems/menuItemsController');
const isAdmin = require("../../middleware/isAdmin");


//Gel all Menu
router.get('/getMenu', auth, isAdmin, menuItemsController.getMenu);

//Get all menuItems items
router.get('/', auth, isAdmin, menuItemsController.index);

//Save menuItem
router.post('/create', auth, isAdmin, menuItemsController.create);

//Edit menu item
router.post('/edit', auth, isAdmin, menuItemsController.edit);

//View details
router.post('/viewDetails', auth, isAdmin, menuItemsController.viewDetails);

//query one Item
router.post('/view', auth, isAdmin, menuItemsController.view);

//delete menu item
router.post('/delete', auth, isAdmin, menuItemsController.destroy);



module.exports = router;