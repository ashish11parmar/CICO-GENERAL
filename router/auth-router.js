const express = require('express');
const { userSignup, userLogin, verifyOTP } = require('../controllers/employee-controller');
const router = express.Router();

// routes for register and login 
router.post('/signup', userSignup)
router.post('/signin', userLogin);
router.post('/verifyotp', verifyOTP)

module.exports = router;