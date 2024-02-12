const express = require('express');
const { getAllEmployees, createNewEmployee, updateEmployee, deleteEmployee } = require('../controllers/employee-controller');
const { verifyUser } = require('../utils/verifyToken');
const router = express.Router();

router.get('/', verifyUser, getAllEmployees)
router.post('/employee', verifyUser, createNewEmployee)
router.put('/employee/:id', verifyUser, updateEmployee)
router.delete('/employee/:id', verifyUser, deleteEmployee)

module.exports = router;