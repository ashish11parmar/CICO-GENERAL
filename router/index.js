const express = require('express');
const router = express.Router();
const authRouter = require('./auth-router');
const employeeRouter = require('./employee-router');

router.use('/api/auth', authRouter);
router.use('/api/employee', employeeRouter)

module.exports = router;