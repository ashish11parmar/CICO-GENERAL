const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const User = require('../model/user.model');
const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { Department } = require('../model/hrms.model');

const userController = {}

// This functiuon is for login and generate jwt token
userController.adminLogin = async (req, res) => {
    console.log(req.body);
    try {
        const userDetails = await User.findOne({ email: req.body.email }) // find user details using email
        if (!userDetails) {
            return res.status(404).json({ msg: "Email not found" })
        }
        const bytes = CryptoJS.AES.decrypt(userDetails.password, 'cico-general');
        const isPasswordCorrect = bytes.toString(CryptoJS.enc.Utf8);
        if (isPasswordCorrect !== req.body.password) {
            return res.status(500).json({ msg: "Password is incorrect!" })
        }
        if (userDetails.isVerified) {
            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours for token expire
                id: userDetails._id,
            }, process.env.SECRET_KEY);
            res.cookie('access_token', token, {
                expires: new Date(Date.now() + 86400), // 24 hours for token expire
                httpOnly: true
            });
            // create payload for giving response in the client-side.
            const userdata = {
                token: token,
                id: userDetails._id,
                user_display_name: userDetails.firstName + ' ' + userDetails.lastName,
                phoneNumber: userDetails.phoneNumber,
                user_email: userDetails.email,
                isVerified: userDetails.isVerified
            }
            return res.json({ msg: "user signed in successfully", data: userdata });
        } else {
            const otp = Math.floor(1000 + Math.random() * 9000);
            sendVerificationCode(req.body.email, otp)
            const expire = Date.now() + 600 * 1000; // 10 minute from now
            await User.findOneAndUpdate({ email }, { $set: { otp: otp } }, { new: true })
            await User.findOneAndUpdate({ email }, { $set: { otpExpire: expire } }, { new: true })
            return res.status(201).json({ msg: "Otp sent to your email" })
        }
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong", data: error })
    }
}

userController.userLogin = async (req, res) => {
    try {
        const userDetails = await User.findOne({ email: req.body.email }) // find user details using email
        if (!userDetails) {
            return res.status(404).json({ msg: "Email not found" })
        }
        const bytes = CryptoJS.AES.decrypt(userDetails.password, 'cico-general');
        const isPasswordCorrect = bytes.toString(CryptoJS.enc.Utf8);
        if (isPasswordCorrect === req.body.password || !userDetails.isCompany) {
            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours for token expire
                id: userDetails._id,
            }, process.env.SECRET_KEY);

            res.cookie('access_token', token, {
                expires: new Date(Date.now() + 86400), // 24 hours for token expire
                httpOnly: true
            });

            const userdata = {
                token: token,
                _id: userDetails._id,
                user_display_name: userDetails.firstName + ' ' + userDetails.lastName,
                firstName: userDetails.firstName,
                phoneNumber: userDetails.phoneNumber,
                user_email: userDetails.email,
                isVerified: userDetails.isVerified
            }
            return res.json({ msg: "user signed in successfully", data: userdata });
        } else {
            return res.status(500).json({ msg: "Something went wrong" })
        }
    } catch (error) {
        return res.status(500).json({ msg: "Something went wrong", data: error })
    }
}


// This funcxtion will register new emoployee or signup with new company 
userController.adminSignup = async (req, res) => {
    try {
        const response = await User.findOne({ email: req.body.email })
        const newPass = CryptoJS.AES.encrypt(req.body.password, 'cico-general');
        req.body.password = newPass;
        const otp = Math.floor(1000 + Math.random() * 9000);
        const expire = Date.now() + 600 * 1000; // 10 minute from now
        req.body.otp = otp;
        req.body.otpExpire = expire;
        sendVerificationCode(req.body.email, otp)
        if (response) { return res.status(400).json({ msg: "user already exists.", }) }
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ msg: "user registered succesfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal Server Error...", data: error })

    }
}

const sendVerificationCode = async (email, otp) => {
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, "../views/verification.hbs"), "utf8")
    const otpTemplate = handlebars.compile(emailTemplateSource)
    const htmlToSend = otpTemplate({ otp })
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "CICO Application - OTP Verification",
        html: htmlToSend
    }


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD
        }
    });

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info);
        }
    });
}

userController.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ msg: "OTP is required.", });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "User not found.", });
        }
        if (user.otp !== otp) {
            return res.status(401).json({ message: "The OTP entered is invalid please verify its accuracy." });
        }
        if (user.otpExpire && new Date() > new Date(user.otpExpire)) {
            return res.status(401).json({ msg: "OTP has expired." });
        }
        user.isVerified = true;
        await user.save();
        await User.findOneAndUpdate({ email }, { $unset: { otp: 1 } }, { new: true });
        await User.findOneAndUpdate({ email }, { $unset: { otpExpire: 1 } }, { new: true });
        return res.status(200).json({ msg: "Email verified successfully." });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ msg: "Internal Server Error.", data: error });
    }
}

userController.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Generate a new OTP
        const otp = Math.floor(1000 + Math.random() * 9000);
        const expire = Date.now() + 600 * 1000; // 10 minute from now 
        // Send the new OTP to the user's email
        sendVerificationCode(email, otp);
        await User.findOneAndUpdate({ email }, { $set: { otp: otp }, }, { new: true })
        await User.findOneAndUpdate({ email }, { $set: { otpExpire: expire } }, { new: true })
        // Update the user record in the database with the new OTP
        return res.status(200).json({ message: "OTP resent successfully." });
    } catch (error) {
        console.error("Error resending OTP:", error);
        return res.status(500).json({ message: "Internal Server Error.", data: error });
    }
}

// This function will create new employee company wise 
userController.createEmployee = async (req, res) => {
    const companyId = req.user.id
    try {
        const emp = await User.findOne({ email: req.body.email }); // Find user already exist or not 
        if (emp) { return res.status(400).json({ msg: "Email already exists." }) }
        const newPass = CryptoJS.AES.encrypt(req.body.password, 'cico-general');
        req.body.password = newPass;
        req.body.isCompany = false;
        req.body.isVerified = false;
        req.body.companyId = companyId; // Assign the company's ObjectId to the employee's companyId field
        const employee = new User(req.body);
        await employee.save();
        res.status(201).json({ msg: "employee added succesfully" });
    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ msg: "Internal server error", data: error });
    }
}

// get all user from database
userController.getEmployeesCompanyWise = async (req, res) => {
    const companyId = req.user.id
    try {
        // Retrieve all employees for the found company
        const employees = await User.find({ companyId: companyId });
        if (!employees.length) {
            return res.status(404).json({ msg: "No employees found for this company." });
        }

        User.find({ companyId: companyId })
            .populate('companyId')
            .populate('department', 'title')
            .populate('role', 'title')
            .populate('type', 'title')
            .exec((err, employees) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (!employees.length) {
                    return res.status(404).json({ msg: "No employees found for this company." });
                }
                const employeePayload = employees.map(employee => ({
                    display_name: employee.firstName + ' ' + employee.middleName + ' ' + employee.lastName,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    phoneNumber: employee.phoneNumber,
                    department: employee.department ? employee.department.title : null,
                    type: employee.type ? employee.type.title : null,
                    role: employee.role ? employee.role.title : null,
                    email: employee.email,
                    employeeID: employee.employeeID,
                    _id: employee._id
                }));
                // const employeePayload = employees.map(employee => ({
                //     display_name: employee.firstName + ' ' + employee.middleName + ' ' + employee.lastName,
                //     firstName: employee.firstName,
                //     lastName: employee.lastName,
                //     phoneNumber: employee.phoneNumber,
                //     departments: employee.department.map(dept => dept.title),
                //     types: employee.type.map(empType => empType.title),
                //     roles: employee.role.map(empRole => empRole.title),
                //     email: employee.email,
                //     employeeID: employee.employeeID,
                //     _id: employee._id
                // }));

                res.status(200).json({ msg: "Employees found for the company.", data: employeePayload });
            });
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ msg: "Internal server error", data: error });
    }
}

userController.getSingleEmployee = async (req, res) => {
    const _id = req.params.id;
    if (!_id) return res.status(400).json({ msg: "employee id is required.", });
    const employee = await User.findOne({ _id: _id })
    if (!employee) return res.status(400).json({ msg: "employee not found.", });
    employee.password = undefined;
    return res.status(200).json({ msg: "Employee found successfully", data: employee })
}



// this function will Update the employee details using id 
userController.updateEmployee = async (req, res) => {
    const _id = req.params.id;
    if (!_id) return res.status(400).json({ msg: "employee id is required.", });
    const updatedEmployee = await User.findByIdAndUpdate(_id, req.body, { new: true })
    if (updatedEmployee) {
        return res.status(200).json({ msg: "Employee updated successfully" })
    } else {
        return res.status(400).json({ msg: "Employee not found." })
    }
}



// This function will delete the employee using there is 
userController.deleteEmployee = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    if (!id) return res.status(400).json({ msg: "employee id is required.", });
    const employee = await User.findOneAndDelete({ _id: id }).exec();
    if (!employee) { return res.status(400).json({ msg: "employee not found.", }); }
    res.status(200).json({ msg: "employee deleted successfully" });
}

userController.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(204).json({ msg: "email is required" })
        }
        const userDetails = await User.findOne({ email: email })
        console.log("userDetails:", userDetails)
        if (!userDetails) {
            return res.status(404).json({ msg: "User not found" })
        }
    }
    catch (error) {
        return res.status(500).json({ msg: "Something went wrong", data: { err: error } })
    }
}


//________Employee Work-Exp And Education-Info__________

userController.createWorkExp = async (req, res) => {
    const _id = req.params.id;
    if (!_id) return res.status(400).json({ msg: "employee id is required.", });
    const employee = await User.findById(_id)
    req.body._id = new ObjectId();
    employee.workExperience.push(req.body)
    await employee.save();
    if (employee) {
        return res.status(200).json({ msg: "Employee work experience added successfully", data: employee.workExperience })
    } else {
        return res.status(400).json({ msg: "Employee not found." })
    }
}

userController.getWorkExp = async (req, res) => {
    const _id = req.params.id;
    if (!_id) return res.status(400).json({ msg: "employee id is required.", });
    const employee = await User.findById(_id)
    if (employee) {
        return res.status(200).json({ msg: "Employee work experience found successfully", data: employee.workExperience })
    } else {
        return res.status(400).json({ msg: "Employee not found." })
    }
}


userController.createEducation = async (req, res) => {
    const _id = req.params.id;
    if (!_id) return res.status(400).json({ msg: "employee id is required." });
    const employee = await User.findById(_id)
    req.body._id = new ObjectId();
    employee.education.push(req.body)
    await employee.save();
    if (employee) {
        return res.status(200).json({ msg: "Employee education added successfully" })
    } else {
        return res.status(400).json({ msg: "Employee not found." })
    }
}

userController.getEducation = async (req, res) => {
    const _id = req.params.id;
    if (!_id) return res.status(400).json({ msg: "employee id is required.", });
    const employee = await User.findById(_id)
    if (employee) {
        return res.status(200).json({ msg: "Employee education found successfully", data: employee.education })
    } else {
        return res.status(400).json({ msg: "Employee not found." })
    }
}

module.exports = userController;
