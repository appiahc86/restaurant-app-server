const express = require("express");
const router = express.Router();

const userAuthController = require("../../../controllers/users/auth/userAuthController");

//Register new user
router.post("/register", userAuthController.create);

//Verify email
router.post("/verify-email", userAuthController.verifyEmail);

//Resend email verification code
router.post("/resend-verification-code", userAuthController.resendVerification);

//Login
router.post('/login', userAuthController.login);

//Request password reset code
router.post('/password-reset-code', userAuthController.requestPasswordResetCode);

//Reset password
router.post('/reset-password', userAuthController.resetPassword);

module.exports = router;