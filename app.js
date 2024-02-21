const express = require("express");
const db = require('./db/conn');
const indexRouter = require('./router/index');
const bodyParser = require('body-parser');
const PORT = process.env.PORT;
const cors = require("cors");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

//_______MainRoute________//
app.use('/', indexRouter)

//_______Port listen_______//
app.listen(PORT, () => {
    console.log(`${PORT} is running`);
})
