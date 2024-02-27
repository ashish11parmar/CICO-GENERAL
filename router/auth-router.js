const express = require('express');
// const { adminSignup, adminLogin, verifyOTP, resendOtp, userLogin, forgotPassword } = require('../controllers/employee-controller');
const { validateAdmin, validateLogin } = require('../validation/validate-Controller');
const userController = require('../controllers/employee-controller');
const router = express.Router();

// routes for register and login 
router.post('/signup', validateAdmin, userController.adminSignup)
router.post('/signin', validateLogin, userController.adminLogin)
router.post('/verifyotp', userController.verifyOTP)
router.post('/resentotp', userController.resendOtp)
router.post('/login', validateLogin, userController.userLogin)
router.post('/forgotpassword', userController.forgotPassword)

module.exports = router;