const Mongoose = require('mongoose');

// Database URI
const uri = "mongodb+srv://leeuwin:%40Maungatapu96@chat.bpty5ln.mongodb.net/?retryWrites=true&w=majority&appName=Chat";

// Function to connect to MongoDB
const connectDB = async () => {
    // Pause execution until promise is returned by Mongoose.connect
    await Mongoose.connect(uri);

    console.log("MongoDB Connected");
}

// Export connectDB function
module.exports = connectDB;