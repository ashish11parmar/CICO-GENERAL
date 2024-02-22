const express = require('express');
const { adminSignup, adminLogin, verifyOTP, resendOtp, userLogin, forgotPassword } = require('../controllers/employee-controller');
const { validateAdmin, validateLogin } = require('../validation/validate-Controller');
const router = express.Router();

// routes for register and login 
router.post('/signup', validateAdmin, adminSignup)
router.post('/signin', validateLogin, adminLogin)
router.post('/verifyotp', verifyOTP)
router.post('/resentotp', resendOtp)
router.post('/login', validateLogin, userLogin)
router.post('/forgotpassword', forgotPassword)

module.exports = router;