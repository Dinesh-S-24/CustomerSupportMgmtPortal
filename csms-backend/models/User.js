const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: [true, "Password hash is required"]
        },

        role: {
            type: String,
            enum: ["customer", "agent", "admin"],
            default: "customer"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        collection: "users",
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
