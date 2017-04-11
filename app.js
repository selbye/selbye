var express = require("express");
var app = express();
var mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    FacebookStrategy = require("passport-facebook"),
    User = require("./models/user"),
    Book = require("./models/book"),
    fs = require("file-system"),
    // multer = require('multer'),
    // upload = multer({ dest: './uploads' }),
    server = require("http").Server(app),
    io = require('socket.io')(server);

// app.use(multer({dest:'./uploads/'}))

var bookRoutes = require("./routes/books"),
    userRoutes = require("./routes/users"),
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


passport.use(new FacebookStrategy({
    clientID: 1437501352988595,
    clientSecret: "c6561bc448934e420783c46363d84e52",
    callbackURL: 'http://localhost:3000/login/facebook/return',
    profileFields: ['id', 'displayName', 'name', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
       process.nextTick(function() {
           console.log(profile)
      User.findOne({ 'facebook.id': profile.id }, function(err, user) {
        if (err)
          return cb(err);
        if (user) {
          return cb(null, user);

        //   passport.serializeUser();
    } else {
          var newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.token = accessToken;
          newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
          newUser.save(function(err) {
            if (err)
              throw err;
            return cb(null, newUser);
          });
        }
      });
    });
    // User.findOrCreate({ 
    //     'facebook.id': profile.id,
    //     'facebook.token': accessToken,
    //     // email: profile.emails[0].value
    //  }, function (err, user) {
    //      if(err){
    //          console.log(err)
    //      }else{
    //      console.log(user);
    //   return cb(err, user);
    //      }
    // });
    // console.log(db);
    // console.log(profile)
  }
));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(indexRoutes);
app.use(userRoutes);
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

