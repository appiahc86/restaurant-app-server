const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const zipCodesController = require('../../controllers/zipCodes/zipCodesController');
const isAdmin = require("../../middleware/isAdmin");

//Get zip codes
router.get('/', auth, isAdmin, zipCodesController.index);

//Save zip code
router.post('/', auth, isAdmin, zipCodesController.create);

//View zip code
router.post('/view', auth, isAdmin, zipCodesController.view);

//Edit zip code
router.post('/edit', auth, isAdmin, zipCodesController.edit);

//Delete zip code
router.post('/delete', auth, isAdmin, zipCodesController.destroy);

module.exports = router;
