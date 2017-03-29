var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
    name: String,
    price: Number,
    desc: String,
    image: String,
    owner :{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
})

module.exports = mongoose.model("Book", bookSchema);