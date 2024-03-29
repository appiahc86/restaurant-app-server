const express = require("express");
const router = express.Router();

const userAuthController = require("../../../controllers/users/auth/userAuthController");


//Login
router.post('/login', userAuthController.login);

//Request password reset code
router.post('/password-reset-code', userAuthController.requestPasswordResetCode);

//Reset password
router.post('/reset-password', userAuthController.resetPassword);

module.exports = router;