const express = require('express');
const { getEmployeesCompanyWise, updateEmployee, deleteEmployee, createEmployee, employeeRole, employeeStatuss, employeeTypes, getSingleEmployee } = require('../controllers/employee-controller');
const { verifyToken } = require('../services/verifyToken');
const { validateCreateEmp } = require('../validation/validate-Controller');
const { createDesignation, getDesignations, updateDesignation, deleteDesignation, getEmployeeTypes, createEmployeeType, updateEmployeeType, deleteEmployeeType } = require('../controllers/hrms-controller');
const router = express.Router();


// Routes for crud for register user 
router.post('/', validateCreateEmp, verifyToken, createEmployee)
router.get('/all', verifyToken, getEmployeesCompanyWise)
router.put('/:id', verifyToken, updateEmployee)
router.delete('/:id', verifyToken, deleteEmployee)
router.get('/single/:id', verifyToken, getSingleEmployee)

//_____________Employee Designation_________________
router.post('/designation', createDesignation)
router.get('/designation', getDesignations)
router.put('/designation/:id', updateDesignation)
router.delete('/designation/:id', deleteDesignation)

//_____________Employee Type______________________
router.get('/types', getEmployeeTypes)
router.post('/types', createEmployeeType)
router.put('/types/:id', updateEmployeeType)
router.delete('/types/:id', deleteEmployeeType)



module.exports = router;