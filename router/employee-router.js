const express = require('express');
const { getEmployeesCompanyWise, updateEmployee, deleteEmployee, createEmployee, employeeRole, employeDepartments, employeeStatuss, employeeTypes } = require('../controllers/employee-controller');
const { verifyToken } = require('../services/verifyToken');
const router = express.Router();


// Routes for crud for register user 
router.post('/', verifyToken, createEmployee)
router.get('/all', verifyToken, getEmployeesCompanyWise)
router.put('/:id', verifyToken, updateEmployee)
router.delete('/:id', verifyToken, deleteEmployee)
router.get('/roles', employeeRole)
router.get('/department', employeDepartments)
router.get('/status', employeeStatuss)
router.get('/types', employeeTypes)

module.exports = router;