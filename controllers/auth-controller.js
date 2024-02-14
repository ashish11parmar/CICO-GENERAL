const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

// This functiuon is for login and generate jwt token
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email, !password) { return res.status(422).json({ message: "email and password are required" }) }
        const userDetails = await User.findOne({ email: email })
        if (userDetails) {
            // generate the token 
            const token = jwt.sign({ _id: userDetails._id }, process.env.SECRET_KEY)
            res.cookie('jwtoken', token, {
                expires: new Date(Date.now() + 28800000), // 8 hours for token expire 
                httpOnly: true
            });
            if (userDetails.password === password) { res.json({ message: "user signin successfully", token: token, data: { status: 200 } }); }
            else { res.status(400).json({ message: "Invalid Credential", data: { status: 400 } }) }
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
        const { firstname, lastname, companyname, phone, email, password } = req.body;
        if (!firstname, !lastname, !companyname, !phone, !email, !password) {
            return res.status(400).json({ message: "All field are required.", data: { status: 400 } })
        }
        const response = await User.findOne({ email: email })
        console.log(response);
        if (response) { return res.status(400).json({ message: "user already exists.", data: { status: 400 } }) }
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: "user registered succesfully", data: { status: 400 } });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", data: { status: 500 } })

    }

}

module.exports = { userLogin, userSignup }