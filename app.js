var express = require("express");
var app = express();
var mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    User           = require("./models/user"),
    Book           = require("./models/book");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/books")
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))
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


app.get("/", function(req, res){
    //res.send("success")
    res.redirect("/books/new")
})

//Add new book
app.get("/books/new", function(req, res){
    res.render("books/new.ejs")
})
//CREATE BOOK logic

app.post("/books" ,function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var desc = req.body.desc;
    var newBook = {name : name , price: price, desc: desc }
    Book.create(newBook , function(err, newlyCreated){
        if(err){
            console.log(err)
        }else{
            res.redirect("/")
        }
    })
})

//AUTHENTICATION ROUTES
app.get("/register", function(req, res){
    res.render("register.ejs")
})
//sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err,  user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/");
        })
    })
})

//Login 
app.get("/login", function(req, res){
    res.render("login");
})

app.post("/login",passport.authenticate("local",
    {successRedirect: "/login",
    filureRedirect: "/login"
    }),function(req, res){
})

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})

//isLogin middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.get("*", function(req, res){
    res.send("Error 404");
});

app.listen(3000, function(){
    console.log("server started");
});