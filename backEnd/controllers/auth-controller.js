const jwt = require('jsonwebtoken');
const User = require('../model/Userschema');
const bcrypt = require('bcrypt');




// This functiuon is for login and generate jwt token
const login = async (req, res) => {
    const { email, password } = req.body;


    if (!email, !password) {
        return res.status(422).json({ error: "Plzz filled property" });
    }

    try {
        const login = await User.findOne({ email: email })
        if (login) {
            // generate the token 
            const token = jwt.sign({ _id: login._id }, process.env.SECRET_KEY)
            res.cookie('jwtoken', token, {
                expires: new Date(Date.now() + 691200000), // 8 dyas for token expire
                httpOnly: true
            });

            if (login.password === password) {
                res.json({ message: "user signin successfully", token: token, status: 200 });
            }
            else {
                res.status(400).json({ error: "Invalid Credential", status: 400 })

            }

        } else {
            res.status(400).json({ error: "User not found", status: 400 })
        }


    } catch (err) {
        console.log(err);
    }
}


// This funcxtion will register new emoployee or signup with new company 
const register = async (req, res) => {
    const { firstname, lastname, companyname, phone, email, password } = req.body;

    if (!firstname, !lastname, !companyname, !phone, !email, !password) {
        return res.status(422).json({ error: "Plz filled property", status: 422 });
    }

    try {

        const response = await User.findOne({ email: email })
        if (response) {
            return res.status(422).json({ error: "user already exists" });
        }
        const user = new User({ firstname, lastname, companyname, phone, email, password });
        await user.save();
        res.status(201).json({ message: "user registered succesfully" });


    } catch (err) {
        console.log(err);
    }

}

module.exports = { login, register }