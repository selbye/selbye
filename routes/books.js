var express = require("express");
var router = express.Router();
var fs = require("file-system"),
    multer = require('multer')
var User = require("../models/user"),
    Category = require("../models/categories")
Book = require("../models/book");

router.use(function (req, res, next) {
    // console.log(city);
    // // res.locals.location = location
    // res.locals.currentUser = req.user;
    // currUsr = res.locals.currentUser;
    // //if logged in then this: else currentUser isequals undefined
    // if (currUsr != undefined) {
    //     //store currentUser in temp_user
    //     temp_user = currUsr.username;
    //     // temp_user = currUsr.username;
    //     // temp_user2    = window.temp_user;
    // }
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
        if (file.originalname) {
            file_name = file.originalname;
            callback(null, file.originalname)
        }
        //   callback(null, request.Book.id.toString())
    }
});
var upload = multer({ storage: storage });

//Add new book
router.get("/books/new", isLoggedIn, function (req, res) {
    Category.find({}, function (err, allCats) {
        if (err) {
            console.log(err)
        } else {
            res.render("books/new.ejs", { categories: allCats });
        }

    })

})
// //Check if file already exists
// fs.readdir('images/', (err, files) => {
//     files.forEach(file => {
//         console.log(file);
//     });
// })

//CREATE BOOK logic
//upload.single will add new photo
router.post("/books", isLoggedIn, upload.single('photo'), function (req, res, next) {
    var name = req.body.name,
        price = req.body.price,
        desc = req.body.desc,
        ISBN = req.body.ISBN,
        language = req.body.language,
        author = req.body.author,
        publisher = req.body.publisher,
        pages = req.body.pages,
        city = req.body.city,
        locality = req.body.locality

    // Owner array contains username and userID
    var owner = {
        id: req.user._id,
        username: req.user.username
    }
    category = [
        req.body.category,
        req.body.subCategory
    ]
    try {
        //image path from /images/username/filename directory
        var image = ("/" + temp_user + "/" + file_name);
        var newBook = {
            name: name, price: price, desc: desc, image: image,
            pages: pages, author: author, publisher: publisher, ISBN: ISBN, city: city, locality: locality, owner: owner, category: category
        }
    } catch (err) {
        var newBook = {
            name: name, price: price, desc: desc, image: image,
            pages: pages, author: author, publisher: publisher, ISBN: ISBN,city: city, locality: locality, owner: owner, category: category
        }
    }

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

router.delete("/books/:id", checkBookOwnership, function (req, res) {
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
    cat = req.query.cat
    if (req.cookies.city) {
        if (cat) {
            Book.find({ $and: [{ city: req.cookies.city }, { category: cat }] }, function (err, allBooks) {
                if (err) {
                    console.log(err)
                } else {
                    reg = "," + cat
                    Category.find({ "path": { $regex: ".*" + reg + ".$" } }, function (err, allCats) {
                        if (err) {
                            console.log(err)
                        } else {
                            res.render("books/index", { books: allBooks, categories: allCats });
                        }

                    })
                }
            }).sort({createdAt:-1})
        } else {
            Book.find({ city: req.cookies.city }, function (err, allBooks) {
                if (err) {
                    console.log(err)
                } else {
                    reg = ",books"
                    Category.find({ "path": { $regex: ".*" + reg + ".$" } }, function (err, allCats) {
                        if (err) {
                            console.log(err)
                        } else {
                            res.render("books/index", { books: allBooks, categories: allCats });
                        }

                    })
                }
            }).sort({createdAt:-1})
        }
    } else {
        if (cat) {
            Book.find({ category: cat }, function (err, allBooks) {
                if (err) {
                    console.log(err)
                } else {
                    reg = "," + cat
                    Category.find({ "path": { $regex: ".*" + reg + ".$" } }, function (err, allCats) {
                        if (err) {
                            console.log(err)
                        } else {
                            res.render("books/index", { books: allBooks, categories: allCats });
                        }

                    })
                }
            }).sort({createdAt:-1})
        } else {
            Book.find({}, function (err, allBooks) {
                if (err) {
                    console.log(err)
                } else {
                    reg = ",books"
                    Category.find({ "path": { $regex: ".*" + reg + ".$" } }, function (err, allCats) {
                        if (err) {
                            console.log(err)
                        } else {
                            res.render("books/index", { books: allBooks, categories: allCats });
                        }

                    })
                }
            }).sort({createdAt:-1})
        }
    }
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("back")
}

function checkBookOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id, function (err, foundBook) {
            if (err) {
                res.redirect("/books")
            } else {
                //Does user owns the Book?
                if (foundBook.owner.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    } else {
        res.redirect("back")
    }
}



module.exports = router;