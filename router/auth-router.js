const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/Userschema');
const bcrypt = require('bcrypt');
const { register, login } = require('../controllers/auth-controller');
require('../db/conn');
require('../model/Userschema');


const router = express.Router();

router.post('/register', register)
router.post('/signin', login);

module.exports = router;