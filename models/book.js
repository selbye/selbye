var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
    name: String,
    price: Number,
    desc: String,
    image: String,
    author: String,
    owner :{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    category:[ 
        ]       
})

module.exports = mongoose.model("Book", bookSchema);