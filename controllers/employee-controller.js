const Employee = require("../model/user.model");
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const nodemailer = require('nodemailer');


// This functiuon is for login and generate jwt token
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email, !password) { return res.status(422).json({ message: "email and password are required" }) }
        const userDetails = await User.findOne({ email: email })
        if (userDetails) {
            if (userDetails.isVerified) { /**@note If user is verified then token will generate. */
                // generate the token 
                const token = jwt.sign({ _id: userDetails._id }, process.env.SECRET_KEY)
                res.cookie('jwtoken', token, {
                    expires: new Date(Date.now() + 28800000), // 8 hours for token expire 
                    httpOnly: true
                });
                if (userDetails.password === password) { res.json({ message: "user signin successfully", token: token, data: { status: 200 } }); }
                else { res.status(400).json({ message: "Invalid Credential", data: { status: 400 } }) }
            } else { /**@note If user is not verified then otp will sent user email. */
                const otp = Math.floor(1000 + Math.random() * 9000);
                sendVerificationCode(req.body.email, otp)
                await User.findOneAndUpdate({ email }, { $set: { otp: otp } }, { new: true })
                res.status(404).json({ message: "Otp send In your email", data: { status: 404 } })
            }
        } else {
            res.status(404).json({ message: "User not found", data: { status: 404 } })
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", data: { status: 500 } })
    }
}


// This funcxtion will register new emoployee or signup with new company 
const userSignup = async (req, res) => {
    try {
        const { firstName, lastName, companyname, phoneNumber, email, password } = req.body;
        if (!firstName || !lastName || !companyname || !phoneNumber || !email || !password) {
            return res.status(400).json({ message: "All field are required.", data: { status: 400 } })
        }
        const response = await User.findOne({ email: email })
        console.log(response);
        const otp = Math.floor(1000 + Math.random() * 9000);
        req.body.otp = otp;
        sendVerificationCode(req.body.email, otp)
        if (response) { return res.status(400).json({ message: "user already exists.", data: { status: 400 } }) }
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: "user registered succesfully", data: { status: 400 } });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error...", data: { status: 500 } })

    }

}


const sendVerificationCode = async (email, otp) => {
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "CICO Application - OTP Verification",
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CICO Application - OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }

        .conatiner {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .email-container {
            background-color: #fff;
            padding: 20px;
            width: 50%;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            border: 2px solid #FF8400;
        }

        .company-logo {
            width: 20%;
            margin-bottom: 20px;
        }

        .otp-code {
            font-size: 24px;
            margin-bottom: 20px;
            color: #FF8400;
        }

        .instructions {
            font-size: 16px;
            margin-bottom: 20px;
        }

        .cta-btn {
            padding: 10px 20px;
            background-color: #3498db;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            text-decoration: none;
        }

        .company-info {
            margin-top: 30px;
            font-size: 14px;
            color: #555;
        }

        .copyright {
            margin-top: 10px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
<div class="conatiner">
    <div class="email-container">
        <img src="https://i.ibb.co/PmWnNqx/new-logo.png" alt="Company Logo" class="company-logo">
        <h2>CICO Admin - OTP Verification</h2>
        <p>Dear User</p>
        
        <p class="otp-code">Your OTP: <strong>${otp}</strong></p>

        <p class="instructions">Please use the following OTP to complete the verification process for the CICO Admin panel.</p>

        <div class="company-info">
            <p>Rao Information Technology</p>
            <p>T.N.Rao College, Nr, Saurashtra University Campus, Rajkot</p>
            <p>Contact: +91 7808780826</p>
        </div>

        <div class="copyright">
            <p>&copy; 2024 CICO Rewards & Recognition.</p>
        </div>
    </div>
    </div>
</body>
</html>
        `
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
            console.log("Email sent:", info.response);
        }
    });
}

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP." });
        }
        user.isVerified = true;
        await user.save();
        await User.findOneAndUpdate({ email }, { $unset: { otp: 1 } }, { new: true });
        return res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
}

// get all user from database
const getAllEmployees = async (req, res) => {
    const employees = await Employee.find();
    if (!employees) return res.status(400).json({ message: "No employee found.", data: { status: 400 } });
    res.json(employees);
}

// this function will Update the employee details using id 
const updateEmployee = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "employee id is required.", data: { status: 400 } });
    const employee = await Employee.findOne({ email: req.body.email })
    if (employee) return res.status(400).json({ message: "Email already exists.", data: { status: 400 } });
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({ updatedEmployee })
}


// This function will delete the employee using there is 
const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    if (!id) return res.status(400).json({ message: "employee id is required.", data: { status: 400 } });
    const employee = await Employee.findOneAndDelete({ _id: id }).exec();
    if (!employee) { return res.status(400).json({ message: "employee not found.", data: { status: 400 } }); }
    res.status(400).json({ message: "employee deleted successfully", data: { status: 400 } });
}

module.exports = { userLogin, verifyOTP, userSignup, getAllEmployees, updateEmployee, deleteEmployee }