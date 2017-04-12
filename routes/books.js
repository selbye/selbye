var express = require("express");
var router = express.Router();
var fs = require("file-system"),
    multer = require('multer')
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



router.get("/", function (req, res) {
    //res.send("success")
    res.redirect("/books")
})

// var upload = multer({dest:'uploads/'});
var storage = multer.diskStorage({
    destination: function (request, file, callback) {
        //fs.mkdir will create new directory at /images/username for each user
        fs.mkdir("images/" + temp_user)
        //call back will store image at /images/username
        callback(null, "images/" + temp_user);
    },
    filename: function (request, file, callback) {
        file_name = file.originalname;
        callback(null, file.originalname)
        //   callback(null, request.Book.id.toString())
    }
});
var upload = multer({ storage: storage });

//Add new book
router.get("/books/new", function (req, res) {
    res.render("books/new.ejs")
})
// //Check if file already exists
// fs.readdir('images/', (err, files) => {
//     files.forEach(file => {
//         console.log(file);
//     });
// })

//CREATE BOOK logic
//upload.single will add new photo
router.post("/books", upload.single('photo'), function (req, res, next) {
    var name = req.body.name;
    var price = req.body.price;
    var desc = req.body.desc;
    // Owner array contains username and userID
    var owner = {
        id: req.user._id,
        username: req.user.username
    }
    //image path from /images/username/filename directory
    var image = ("/" + temp_user + "/" + file_name);
    var newBook = { name: name, price: price, desc: desc, image: image, owner: owner }
    Book.create(newBook, function (err, newlyCreated) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/books")
        }
    })
})


//Update book info
// app.put("/books/:id", function(req, res){
//     Book.findByIdAndUpdate()
// })

router.delete("/books/:id", function (req, res) {
    Book.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/books")
        }
    })
})

//SHOW page AKA book page
router.get("/books/:id", function (req, res) {
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
router.get("/books", function (req, res) {
    Book.find({}, function (err, allBooks) {
        if (err) {
            console.log(err)
        } else {
            res.render("books/index", { books: allBooks });
        }
    })
})

module.exports = router;