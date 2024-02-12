const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const db = require('./db/conn');
const PORT = process.env.PORT;
const User = require('./model/Userschema');
const cors = require("cors");

const app = express();
app.use(cors());
// app.use(cookieParser());
app.use(express.json());


app.use(express.json());
app.use(require('./router/auth-router'));
app.use(require('./router/employee-route'));

app.listen(PORT, () => {
    console.log(`${PORT} is running`);
})
