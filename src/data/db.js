const Mongoose = require('mongoose');
const URI = process.env.URI;

const connectDB = async () => {
    await Mongoose.connect(URI);
    console.log("MongoDB Connected");
}

module.exports = connectDB;