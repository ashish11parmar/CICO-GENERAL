const express = require('express');
const { adminSignup, adminLogin, verifyOTP, resendOtp, userLogin, forgotPassword } = require('../controllers/employee-controller');
const router = express.Router();

// routes for register and login 
router.post('/signup', adminSignup)
router.post('/signin', adminLogin);
router.post('/verifyotp', verifyOTP)
router.post('/resentotp', resendOtp)
router.post('/login', userLogin)
router.post('/forgotpassword', forgotPassword)

module.exports = router;