var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user"),
    Book = require("../models/book");

router.use(function (req, res, next) {
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



//Socket test
router.get("/socket", function(req, res){
    res.render("socket")
})

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });
// });

//AUTHENTICATION ROUTES
router.get("/register", function (req, res) {
    res.render("register.ejs")
})
//sign up logic
router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/");
        })
    })
})

//Login 
router.get("/login", function (req, res) {
    res.render("login");
})

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        filureRedirect: "/login"
    }), function (req, res) {
    })

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
})

module.exports = router;