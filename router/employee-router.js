const express = require('express');
const { getAllEmployees, updateEmployee, deleteEmployee } = require('../controllers/employee-controller');
const { verifyToken } = require('../utils/verifyToken');
const router = express.Router();


// Routes for crud for register user 
router.get('/all', verifyToken, getAllEmployees)
router.put('/:id', verifyToken, updateEmployee)
router.delete('/:id', verifyToken, deleteEmployee) 

module.exports = router;