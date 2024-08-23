const Mongoose = require('mongoose');
const { URI } = require('../../config.js');

const connectDB = async () => {
    await Mongoose.connect(URI);
    console.log("MongoDB Connected");
}

module.exports = connectDB;