const express = require('express');
const { register, login } = require('../controllers/auth-controller');

const router = express.Router();

// routes for register and login 
router.post('/register', register)
router.post('/login', login);

module.exports = router;