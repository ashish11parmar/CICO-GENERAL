const express = require('express');
const { getAllEmployees, updateEmployee, deleteEmployee } = require('../controllers/employee-controller');
const { verifyToken } = require('../utils/verifyToken');
const router = express.Router();


// Routes for crud for register user 
router.get('/', verifyToken, getAllEmployees)
router.put('/employee/:id', verifyToken, updateEmployee)
router.delete('/employee/:id', verifyToken, deleteEmployee)

module.exports = router;