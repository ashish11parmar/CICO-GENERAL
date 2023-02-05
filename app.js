const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const db = require('./db/conn');
const PORT = process.env.PORT;
const User = require('./model/Userschema');

const app = express();

app.use(express.json());
app.use(require('./router/router'));

app.listen(PORT, ()=>{
    console.log(`${PORT} is running`);

 
app.get('/signin', (req, res)=>{
    res.send("server side signin page")
})
})
