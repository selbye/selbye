var express = require("express");
var app = express();
var mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    cookieParser = require('cookie-parser'),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    FacebookStrategy = require("passport-facebook"),
    GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
    User = require("./models/user"),
    Book = require("./models/book"),
    flash =require("connect-flash"),
    Category = require("./models/categories")
fs = require("file-system"),
    // multer = require('multer'),
    // upload = multer({ dest: './uploads' }),
    server = require("http").Server(app),
    io = require('socket.io')(server)
var configAuth = require('./config/auth');

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
app.use(cookieParser())
app.use(flash())
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
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'displayName', 'name', 'email']
},
    function (accessToken, refreshToken, profile, cb) {
        process.nextTick(function () {
            User.findOne({ 'facebook.id': profile.id }, function (err, user) {
                if (err)
                    return cb(err);
                if (user) {
                    return cb(null, user);
                } else {
                    var newUser = new User();
                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = accessToken;
                    newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    newUser.email = (profile.emails[0].value || '').toLowerCase();
                    newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return cb(null, newUser);
                    });
                }
            });
        });
    }
));

//GOOGLE Login
passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
},
    function (token, refreshToken, profile, done) {
        process.nextTick(function () {
            User.findOne({ 'google.id': profile.id }, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, user);
                } else {
                    var newUser = new User();
                    newUser.google.id = profile.id;
                    newUser.google.token = token;
                    newUser.google.name = profile.displayName;
                    newUser.email = profile.emails[0].value;
                    newUser.google.email = profile.emails[0].value;
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(indexRoutes);
app.use(userRoutes);
app.use(bookRoutes);



// Category.create({_id:"books",path: null})
// Category.create({_id:"GTU books",path: ",books,"})
// Category.create({_id:"Novels",path: ",books,"})
// Category.create({_id:"Action",path: ",books,Novels,"})
// Category.create({_id:"Drama",path: ",books,Novels,"})
// Category.create({_id:"10-12th",path: ",books,"})
// Category.create({_id:"10th",path: ",books,10-12th,"})
// Category.create({_id:"11th",path: ",books,10-12th,"})
// Category.create({_id:"12th",path: ",books,10-12th,"})
// Category.create({_id:"1-9th",path: ",books,"})
// Category.create({_id:"3rd",path: ",books,1-9th,"})
// Category.create({_id:"4th",path: ",books,1-9th,"})
// Category.create({_id:"Computer Science",path: ",books,GTU books,"})
// Category.create({_id:"AAD",path: ",books,GTU books,Computer Science,"})
// Category.create({_id:"Mechanical Engineering",path: ",books,GTU books,"})
// Category.create({_id:"Civil Engineering",path: ",books,GTU books,"})












// app.use(function (req, res, next) {
//     res.locals.currentUser = req.user;
//     // console.log(res.locals)
//     currUsr = res.locals.currentUser;
//     //if logged in then this: else currentUser isequals undefined
//     if (currUsr != undefined) {
//         //store currentUser in temp_user
//         temp_user = currUsr.username;
//         // temp_user = currUsr.username;
//         // temp_user2    = window.temp_user;
//     }
//     next();
// })

// sendgrid email send
// var helper = require('sendgrid').mail;
// var fromEmail = new helper.Email('yo@selbye.com');
// var toEmail = new helper.Email('kunalht1@gmail.com');
// var subject = 'Guess who the sender IS??';
// var content = new helper.Content('text/plain', 'Hello, Email!');
// var mail = new helper.Mail(fromEmail, subject, toEmail, content);

// var sg = require('sendgrid')(configAuth.sendgridAuth.api);
// var request = sg.emptyRequest({
//   method: 'POST',
//   path: '/v3/mail/send',
//   body: mail.toJSON()
// });

// sg.API(request, function (error, response) {
//   if (error) {
//     console.log('Error response received');
//   }
//   console.log(response.statusCode);
//   console.log(response.body);
//   console.log(response.headers);
// });



app.get("/geo", function (req, res) {
    res.render("geo")
})
app.post("/geo", function (req, res) {
    console.log(req.body)
})

//Messages 
app.get("/message/:id", function (req, res) {
    res.send("worksls")
})



app.get("*", function (req, res) {
    res.send("Error 404");
});


server.listen(3000, function () {
    console.log("server started");
});

