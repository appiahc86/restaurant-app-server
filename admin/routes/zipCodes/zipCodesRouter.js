const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const zipCodesController = require('../../controllers/zipCodes/zipCodesController');

//Get zip codes
router.get('/', auth, zipCodesController.index);

//Save zip code
router.post('/', auth, zipCodesController.create);

//View zip code
router.post('/view', auth, zipCodesController.view);

//Edit zip code
router.post('/edit', auth, zipCodesController.edit);

//Delete zip code
router.post('/delete', auth, zipCodesController.destroy);


module.exports = router;