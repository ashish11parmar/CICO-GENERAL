const express = require('express');
const { verifyToken } = require('../services/verifyToken');
const { validateCreateEmp } = require('../validation/validate-Controller');
const userController = require('../controllers/employee-controller');
const hrmsController = require('../controllers/hrms-controller');
const router = express.Router();


// Routes for crud for register user 
router.post('/', validateCreateEmp, verifyToken, userController.createEmployee)
router.get('/all', verifyToken, userController.getEmployeesCompanyWise)
router.put('/:id', verifyToken, userController.updateEmployee)
router.delete('/:id', verifyToken, userController.deleteEmployee)
router.get('/single/:id', verifyToken, userController.getSingleEmployee)

//_____________Employee Designation_________________
router.post('/designation', verifyToken, hrmsController.createDesignation)
router.get('/designation', hrmsController.getDesignations)
router.put('/designation/:id', hrmsController.updateDesignation)
router.delete('/designation/:id', hrmsController.deleteDesignation)

//_____________Employee Type______________________
router.get('/types', hrmsController.getEmployeeTypes)
router.post('/types', verifyToken, hrmsController.createEmployeeType)
router.put('/types/:id', hrmsController.updateEmployeeType)
router.delete('/types/:id', hrmsController.deleteEmployeeType)

// ____________Employee Role______________________
router.post('/roles', verifyToken, hrmsController.createEmployeeRole)
router.get('/roles', hrmsController.getEmployeeRoles)

//_____________Employee HRMS All__________________
router.get('/hrms', hrmsController.allHrmsType)

//_____________Employee Work-Exp__________________
router.post('/:id/workexp', verifyToken, userController.createWorkExp)
router.get('/:id/workexp', verifyToken, userController.getWorkExp)


//_____________Employee Education_________________
router.post('/:id/eduation', verifyToken, userController.createEducation)
router.get('/:id/eduation', verifyToken, userController.getEducation)



module.exports = router;