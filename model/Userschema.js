const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    work:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    tokena:[
        {
        token:{
            type:String,
            required:true
        }
    }
    ]
})

UserSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password =await bcrypt.hash(this.password, 12);
        this.cpassword =await bcrypt.hash(this.password, 12);
    }
    next();
})

UserSchema.methods.generateAuthToken = async function(){
     try{

        const token = jwt.sign({_id: this._id}, process.env. SECRET_KEY)
        this.tokena = this.tokena.concat({token:token});
        await this.save();
        return token;

     }catch(err){
            console.log(err);
     }
}


const User = mongoose.model('user', UserSchema);

module.exports = User;