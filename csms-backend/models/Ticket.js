const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            minlength: [3, "Subject must be at least 3 characters"],
            maxlength: [200, "Subject cannot exceed 200 characters"]
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            minlength: [5, "Description must be at least 5 characters"]
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "Order Issue",
                "Delivery Issue",
                "Product Issue",
                "Payment Issue",
                "Refund Issue",
                "Account Issue",
                "Other"
            ]
        },

        priority: {
            type: String,
            required: [true, "Priority is required"],
            enum: [
                "Low",
                "Medium",
                "High",
                "Critical"
            ]
        },

        status: {
            type: String,
            enum: [
                "Open",
                "Assigned",
                "In Progress",
                "Waiting for Customer",
                "Resolved",
                "Closed"
            ],
            default: "Open"
        },

        attachmentUrl: {
            type: String,
            default: null,
            trim: true
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        assignedAgentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        },

        isDeleted: {
            type: Boolean,
            default: false,
            // index: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: "tickets"
    }
);

module.exports = mongoose.model("Ticket", ticketSchema);