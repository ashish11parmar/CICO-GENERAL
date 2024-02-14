const express = require('express');
const { userSignup, userLogin } = require('../controllers/auth-controller');

const router = express.Router();

// routes for register and login 
router.post('/register', userSignup)
router.post('/login', userLogin);

module.exports = router;