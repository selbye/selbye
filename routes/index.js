var express = require("express");
var router = express.Router();
var passport = require("passport"),
    geoLocator = require("geolocator"),
    FacebookStrategy = require("passport-facebook"),
    GoogleStrategy = require("passport-google-oauth");
var User = require("../models/user"),
    Book = require("../models/book");

var city, address

router.use(function (req, res, next) {
    console.log(city)
    res.locals.currentCity = city
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

function checkIfRegistered() {

}
router.get('/login/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

router.get('/login/facebook/return',
    passport.authenticate('facebook', { failureRedirect: '/login', session: true }),
    function (req, res) {
        if (req.user.username != null) {
            // console.log(res.locals)
            res.redirect('/');
        } else {
            res.redirect("/test")
        }
    })

router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/login/google/return', passport.authenticate('google', { failureRedirect: '/login', session: true }),
    function (req, res) {
        if (req.user.username != null) {
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
    // console.log(req.isAuthenticated())
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
    if (req.user.facebook == null) {
        User.findOneAndUpdate({ 'google.id': res.locals.currentUser.google.id }, { 'username': req.body.username }).exec(function (err, founduser) {
            if (err) {
                console.log(err)
            } else {
                res.redirect("back")
            }
        })
    } else if (req.user.google == null) {
        User.findOneAndUpdate({ 'facebook.id': res.locals.currentUser.facebook.id }, { 'username': req.body.username }).exec(function (err, founduser) {
            if (err) {
                console.log(err)
            } else {
                res.redirect("back")
            }
        })
    }

})
router.post("/location", function (req, res) {
    //store city in location var
    console.log(req.body)
    city = req.body.city
    address = req.body.address
})

module.exports = router;