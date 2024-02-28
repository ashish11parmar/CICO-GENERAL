const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
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
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
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
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
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
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
})
const Department = mongoose.model('department', departmentSchema);
const Types = mongoose.model('type', typeSchema);
const Roles = mongoose.model('role', rolesSchema);
module.exports = { Department, Types, Roles };