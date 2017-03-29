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
    multer = require('multer');

var currUsr = "";
var temp_user;
var file_name;


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

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    // console.log(req.user.username)
    currUsr = res.locals.currentUser;
    //if logged in then this: else currentUser isequals undefined
    if(currUsr!=undefined){
    //store currentUser in temp_user
    temp_user = currUsr.username;
    // temp_user = currUsr.username;
    // temp_user2    = window.temp_user;
}
    next();
})

app.get("/", function (req, res) {
    //res.send("success")
    res.redirect("/books")
})

// var upload = multer({dest:'uploads/'});
var storage = multer.diskStorage({
    destination: function (request, file, callback) {
        //fs.mkdir will create new directory at /images/username for each user
        fs.mkdir("images/" + temp_user)
        //call back will store image at /images/username
        callback(null,"images/"+temp_user);
    },
    filename: function (request, file, callback) {
                // callback(null, file.originalname)
        file_name = file.originalname;
        callback(null,file.originalname)
    }
});
var upload = multer({ storage: storage });

//Add new book
app.get("/books/new", function (req, res) {
    res.render("books/new.ejs")
})


//CREATE BOOK logic
//upload.single will add new photo
app.post("/books", upload.single('photo'), function (req, res, next) {
    var name = req.body.name;
    var price = req.body.price;
    var desc = req.body.desc;
    //image path from /images/username/filename directory
    var image  = ("/"+temp_user + "/" + file_name);
    // console.log(image)
    var newBook = { name: name, price: price, desc: desc , image:image }
    Book.create(newBook, function (err, newlyCreated) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/books")
        }
    })
    // upload.fields([{name: 'photo', maxCount: 1 }])
    // console.log(req.body.image)
    // console.log(req.file)
    // console.log(req.files)  
})


// app.get("/mult", function(req, res){
//     res.render("mult.ejs")
// })

// app.post("/multt",upload.any(),  function(req, res ,next){
//     res.redirect("/mult")
//     nameoffile= "hello";
// })
//Update book info
// app.put("/books/:id", function(req, res){
//     Book.findByIdAndUpdate()
// })

//SHOW page AKA book page
app.get("/books/:id", function (req, res) {
    Book.findById(req.params.id).exec(function (err, foundBook) {
        if (err) {
            console.log(err)
        } else {
            res.render("books/show.ejs", { books: foundBook });
        }
    })
})
//Show page
//List of all books AKA home page
app.get("/books", function (req, res) {
    Book.find({}, function (err, allBooks) {
        if (err) {
            console.log(err)
        } else {
            res.render("books/index", { books: allBooks });
        }
    })
})

//AUTHENTICATION ROUTES
app.get("/register", function (req, res) {
    res.render("register.ejs")
})
//sign up logic
app.post("/register", function (req, res) {
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
app.get("/login", function (req, res) {
    res.render("login");
})

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        filureRedirect: "/login"
    }), function (req, res) {
    })

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
})


//isLogin middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.get("*", function (req, res) {
    res.send("Error 404");
});

app.listen(3000, function () {
    console.log("server started");
});

