const Mongoose = require("mongoose");

// Define schema for User model
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
        type: String,
        default: "basic",
        required: true,
    },
    games: [
        {
            id: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            status: {
                type: String,
                enum: ['completed', 'on hold', 'playing'],
                required: true,
                default: 'playing'
            }
        }
    ], 
});

// Create the User model using the defined schema
const User = Mongoose.model("User", UserSchema);

// Export User model
module.exports = User;