const jwt = require('jsonwebtoken');
const User = require('../model/Userschema');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const { email, password } = req.body;


    if (!email, !password) {
        return res.status(422).json({ error: "Plzz filled property" });
    }

    try {
        const login = await User.findOne({ email: email })
        if (login) {

            const ismatch = await bcrypt.compare(password, login.password);

            // generate the token 

            const token = await login.generateAuthToken();
            console.log(token);

            res.cookie('jwtoken', token, {
                expires: new Date(Date.now() + 25832000000),
                httpOnly: true
            });

            if (!ismatch) {
                res.status(400).json({ error: "Invalid Credential" })
            }
            else {
                res.json({ message: "user signin successfully" });

            }

        } else {
            res.status(400).json({ error: "Invalid Credential" })
        }


    } catch (err) {
        console.log(err);
    }
}


const register = async (req, res) => {
    const { name, email, phone, work, password, cpassword } = req.body;

    if (!name, !email, !phone, !work, !password, !cpassword) {
        return res.status(422).json({ error: "Plz filled property" });
    }

    try {

        const response = await User.findOne({ email: email })
        if (response) {
            return res.status(422).json({ error: "user already exists" });
        }
        const user = new User({ name, email, phone, work, password, cpassword });
        await user.save();
        res.status(201).json({ message: "user registered succesfully" });


    } catch (err) {
        console.log(err);
    }

}

module.exports = { login, register }