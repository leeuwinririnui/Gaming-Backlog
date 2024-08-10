// Import Mongoose
const Mongoose = require("mongoose");

// Schema for users
const UserSchema = new Mongoose.Schema({
    username: {
        type: String, 
        unique: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
    },
    role: {
        // Admin wil have "admin" as string
        type: String,
        default: "basic",
        required: true,
    },
});

// Create User model
const User = Mongoose.model("user", UserSchema);

// Export User 
module.exports = User;