const express = require("express");
const db = require('./db/conn');
const PORT = process.env.PORT;
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json());
app.use(require('./router/auth-router'));
app.use(require('./router/employee-router'));

app.listen(PORT, () => {
    console.log(`${PORT} is running`);
})
