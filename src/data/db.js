// Import Mongoose for interacting with MongoDB
const Mongoose = require('mongoose');

// Retrieve MongoDB connection URI from  environment variables
const URI = process.env.URI;

// Connect to MongoDB
const connectDB = async () => {
    await Mongoose.connect(URI);
    console.log("MongoDB Connected");
}

// Export connectDB function
module.exports = connectDB;