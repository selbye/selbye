var express = require("express");
var app = express();
var mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    User = require("./models/user"),
    Book = require("./models/book"),
    fs = require("file-system"),
    // multer = require('multer'),
    // upload = multer({ dest: './uploads' }),
    server = require("http").Server(app),
    io = require('socket.io')(server);

// app.use(multer({dest:'./uploads/'}))

var bookRoutes = require("./routes/books"),
    userRotes = require("./routes/users"),
    indexRoutes = require("./routes/index")



var currUsr = "";
var temp_user;
var file_name;
var doesExist = false;


mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/books")
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "/images"))

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));

//passport configuration
app.use(require("express-session")({
    secret: "M3 is the best car ever",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(indexRoutes);
app.use(userRotes);
app.use(bookRoutes);

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    currUsr = res.locals.currentUser;
    //if logged in then this: else currentUser isequals undefined
    if (currUsr != undefined) {
        //store currentUser in temp_user
        temp_user = currUsr.username;
        // temp_user = currUsr.username;
        // temp_user2    = window.temp_user;
    }
    next();
})

//Messages 
app.get("/message/:id", function(req, res){
    res.send("worksls")
})

app.get("*", function (req, res) {
    res.send("Error 404");
});


server.listen(3000, function () {
    console.log("server started");
});

