const express = require('express');
const router = express.Router();
const authRouter = require('./auth-router');
const employeeRouter = require('./employee-router');
const hrmsRouter = require('./hrms-router')

router.use('/api/auth', authRouter);
router.use('/api/employee', employeeRouter)
router.use('/api/hrms', hrmsRouter)

module.exports = router;