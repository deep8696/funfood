/************************************************************************************ * 
 * WEB322 – Project (Fall 2021) 
 * * I declare that this assignment is my own work in accordance with Seneca Academic 
 * * Policy. No part of this assignment has been copied manually or electronically from 
 * * any other source (including web sites) or distributed to other students. 
 * * Name: Deepkumar Patel
 * * Student ID: 153693189
 * * Course/Section: WEB322 ZAA
 * 
 * 
 * ## Project URLs
 * 
 * 
 * 
 * 
 ************************************************************************************/

 const path = require("path");
 const express = require("express");
 const handlebars = require("express-handlebars");
 const session = require("express-session");
 const fileUpload = require("express-fileupload");
 const bodyParser = require('body-parser');
 const dotenv = require('dotenv');
 const mongoose = require('mongoose');
 dotenv.config({path:"./private/keys.env"});
 const app = express();

 // handlebars engine
app.engine('.hbs', handlebars({ 
    extname: '.hbs',
    defaultLayout: "main"
}));
app.set("view engine", "hbs"); 

//express session

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    // res.locals.user is a global handlebars variable.
    // This means that every single handlebars file can access this variable.
    res.locals.user = req.session.user;
    next();
});
 
 // static files
 app.use("/static", express.static("static")); 

 // Set-up body parser
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json())

//file upload
app.use(fileUpload());

// Load controllers into Express
const generalController = require("./controllers/general");
const menuController = require("./controllers/menu");
const userController = require("./controllers/user");
const loadController = require("./controllers/load-data")
app.use("/", generalController);
app.use("/menu", menuController);
app.use("/user", userController);
app.use("/", loadController);

// connect to MongoDB 
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

 
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);
