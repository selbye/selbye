var express = require("express");
var router = express.Router({mergeParams: true});
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


// User profile


var findBook = function findBook(req, res){
        // Book.find({'owner.username':req.user.username}).exec(function(err, foundBook){
    Book.find({'owner.username':req.params.id}).exec(function(err, foundBook){
        if(err){
            console.log(err)
        }else{
            //pass found book and requested username
            res.render("users/show", {books: foundBook, usr: req.params.id})
        }
    })
}

router.get("/user/:id", findBook);


router.get("/user/:id/profile", function(req, res){
    res.render("users/profile");
})

router.put("/user/:id", function(req, res){
    User.findOneAndUpdate({username:req.params.id}, req.body.user).exec(function(err, founduser){
        if(err){
            console.log(err)
        }else{
            res.redirect("back")
        }
    })
})

//isLogin middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;