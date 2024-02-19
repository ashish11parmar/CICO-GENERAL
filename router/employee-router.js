const express = require('express');
const { getEmployeesCompanyWise, updateEmployee, deleteEmployee, createEmployee } = require('../controllers/employee-controller');
const { verifyToken } = require('../services/verifyToken');
const router = express.Router();


// Routes for crud for register user 
router.post('/', verifyToken, createEmployee)
router.get('/all', verifyToken, getEmployeesCompanyWise)
router.put('/:id', verifyToken, updateEmployee)
router.delete('/:id', verifyToken, deleteEmployee)

module.exports = router;