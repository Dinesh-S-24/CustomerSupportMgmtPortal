const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            required: true,
            index: true
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            minlength: [1, "Message cannot be empty"],
            maxlength: [5000, "Message cannot exceed 5000 characters"]
        },

        isDeleted: {
            type: Boolean,
            default: false
        },

        createdAt: {
            type: Date,
            default: Date.now
            // index: true
        },

        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: "messages"
    }
);

// messageSchema.pre("save", function (next) {
//     this.updatedAt = new Date();
//     next();
// });

module.exports = mongoose.model("Message", messageSchema);