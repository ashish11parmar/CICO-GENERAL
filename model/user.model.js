const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    firstName: {
        type: String,
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
    },
    companyname: {
        type: String
    },
    employeeID: {
        type: String
    },
    birthDate: {
        type: String,
    },
    hiringDate: {
        type: String,
    },
    gender: {
        type: String,
    },
    status: {
        type: String,
    },
    type: {
        type: String,
    },
    role: {
        type: String,
    },
    department: {
        type: String,
    },
    phoneNumber: {
        type: Number,
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
    },

    isCompany: {
        type: Boolean,
        default: false,
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    otp: {
        type: Number
    },
    otpExpire: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    details: {
        type: Object
    },
    education: [{
        _id: { type: String, unique: true, required: true },
        details: Object,
    }],
    workExperience: [{
        type: Object,
    }]
});
UserSchema.index({ otp: 1 }, { expireAfterSeconds: 3600 });
const User = mongoose.model('user', UserSchema);

module.exports = User;