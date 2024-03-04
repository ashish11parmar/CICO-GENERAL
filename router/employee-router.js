const express = require('express');
const { verifyToken } = require('../services/verifyToken');
const { validateCreateEmp } = require('../validation/validate-controller');
const userController = require('../controllers/employee-controller');
const router = express.Router();


// Routes for crud for register user 
router.post('/', validateCreateEmp, verifyToken, userController.createEmployee)
router.get('/all', verifyToken, userController.getEmployeesCompanyWise)
router.put('/:id', verifyToken, userController.updateEmployee)
router.delete('/:id', verifyToken, userController.deleteEmployee)
router.get('/single/:id', verifyToken, userController.getSingleEmployee)

//_____________Employee Work-Exp__________________
router.post('/:id/workexp', verifyToken, userController.createWorkExp)
router.get('/:id/workexp', verifyToken, userController.getWorkExp)


//_____________Employee Education_________________
router.post('/:id/eduation', verifyToken, userController.createEducation)
router.get('/:id/eduation', verifyToken, userController.getEducation)



module.exports = router;