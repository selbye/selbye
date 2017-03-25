var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
    name: String,
    price: Number,
    desc: String
})

module.exports = mongoose.model("Book", bookSchema);