const mongoose = require('mongoose');

const employee = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    }
})

const Employee = mongoose.model('Employee', employee);
module.exports = Employee;