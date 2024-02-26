const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const designationSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    total_employee: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        default: '',
    }
})

const typeSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    total_employee: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        default: '',
    }
})

const rolesSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    total_employee: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        default: '',
    }
})
const Designation = mongoose.model('designation', designationSchema);
const Types = mongoose.model('type', typeSchema);
const Roles = mongoose.model('role', rolesSchema);
module.exports = { Designation, Types, Roles };