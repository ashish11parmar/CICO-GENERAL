const express = require('express');
const { userSignup, userLogin } = require('../controllers/auth-controller');
const { verifyAdmin } = require('../utils/verifyToken');

const router = express.Router();

// routes for register and login 
router.post('/signup', userSignup)
router.post('/signin', userLogin);

module.exports = router;