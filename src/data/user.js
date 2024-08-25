const Mongoose = require("mongoose");

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
            }
        }
    ], 
});

const User = Mongoose.model("user", UserSchema);

module.exports = User;