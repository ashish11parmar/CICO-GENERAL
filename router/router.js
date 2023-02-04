const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/Userschema');
const bcrypt = require('bcrypt');
require('../db/conn');
require('../model/Userschema');


const router = express.Router();

// router.post('/register', (req, res) => {

//     const { name, email, phone, work,  password, cpassword } = req.body;

//     if (!name, !email, !phone, !work, !password, !cpassword) {
//         return res.status(422).json({ error: "Plz filled property" });
//     }

//     User.findOne({ email: email })
//     .then((userExist) => {
//         if (userExist) {
//             return res.status(422).json({ error: "user alresy register" });
//         }
//         const user = new User({ name, email,  phone, work, password, cpassword });

//         user.save().then(() => {
//             res.status(201).json({ message: "user registered succesfully" });
//         }).catch((err)=>res.status(500).json({error:"Failed to register..."}));

//     }).catch(err=>{console.log(err);});

// });

router.post('/register', async (req, res) => {

    const { name, email, phone, work,  password, cpassword } = req.body;

    if (!name, !email, !phone, !work, !password, !cpassword) {
        return res.status(422).json({ error: "Plz filled property" });
    }

    try {
        
      const response = await User.findOne({ email: email })
      if(response){
          return res.status(422).json({ error: "user alresy register" });
      }
      const user = new User({ name, email,  phone, work, password, cpassword });
      await user.save();
      res.status(201).json({ message: "user registered succesfully" });
        
           
    } catch (err) {
        console.log(err);
    }
});
router.post('/signin', async(req, res) =>{
    const {email, password}=req.body;
    
    if(!email, !password){
        return res.status(422).json({error:"Plzz filled property"});
    }

    try {
        const login = await User.findOne({email:email})
        if(login){
            
            const ismatch = await bcrypt.compare(password, login.password);
            const token = await login.generateAuthToken();
            console.log(token);

        if(!ismatch){
            res.status(400).json({error:"Invalid Credential"})
        }
        else{
            res.json({message:"user signin successfully"});
           
        }

        }else{
            res.status(400).json({error:"Invalid Credential"})
        }

        
    } catch (err) {
            console.log(err);
    }
});

module.exports = router;