var express = require("express");
var router = express.Router();
var passport = require("passport"),
    FacebookStrategy = require("passport-facebook"),
    GoogleStrategy   = require("passport-google-oauth");
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
router.get('/login/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

router.get('/login/facebook/return',
    passport.authenticate('facebook', { failureRedirect: '/login', session: true }),
    function (req, res) {
        if (res.locals.currentUser != null) {
            // console.log(res.locals.currentUser)
            res.redirect('/');
        } else {
            res.redirect("/test")
        }
    })

router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/login/google/return', passport.authenticate('google', { failureRedirect: '/login', session: true }),
    function (req, res) {
        if (res.locals.currentUser != null) {
            // console.log(res.locals.currentUser)
            res.redirect('/');
        } else {
            res.redirect("/test")
        }
    })

//Socket test
router.get("/socket", function (req, res) {
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
        console.log(newUser)
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
    console.log(req.isAuthenticated())
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

router.get("/test", function (req, res) {
    res.render("profiletest")
})

//Add username of user logged in with facebook ID
//username = received from input
//res.locals.currentUser.facebook.id is current facebook ID
router.put("/test", function (req, res) {    
    User.findOneAndUpdate({ 'facebook.id': res.locals.currentUser.facebook.id }, { 'username':req.body.username }).exec(function (err, founduser) {
    //    console.log("user"+founduser)
        if (err) {
            console.log(err)
        } else {
            res.redirect("back")
        }
    })
})
module.exports = router;