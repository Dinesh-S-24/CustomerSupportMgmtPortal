const mongoose = require("mongoose");

const Message = require("../models/Message");
const Ticket = require("../models/Ticket");

const {
    successResponse,
    errorResponse
} = require("../utils/response");

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/*
|--------------------------------------------------------------------------
| CHECK TICKET ACCESS
|--------------------------------------------------------------------------
*/

const checkTicketAccess = async (ticketId, user) => {
    const ticket = await Ticket.findOne({
        _id: ticketId,
        isDeleted: false
    });

    if (!ticket) {
        return {
            allowed: false,
            statusCode: 404,
            message: "Ticket not found"
        };
    }

    if (user.role === "admin") {
        return {
            allowed: true,
            ticket
        };
    }

    if (
        user.role === "customer" &&
        ticket.customerId.toString() ===
            user.id.toString()
    ) {
        return {
            allowed: true,
            ticket
        };
    }

    if (
        user.role === "agent" &&
        ticket.assignedAgentId &&
        ticket.assignedAgentId.toString() ===
            user.id.toString()
    ) {
        return {
            allowed: true,
            ticket
        };
    }

    return {
        allowed: false,
        statusCode: 403,
        message: "You do not have access to this ticket"
    };
};

/*
|--------------------------------------------------------------------------
| ADD MESSAGE
|--------------------------------------------------------------------------
*/

const addMessage = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { message } = req.body;

        if (!isValidObjectId(ticketId)) {
            return errorResponse(
                res,
                400,
                "Invalid ticket ID",
                []
            );
        }

        if (!message || !message.trim()) {
            return errorResponse(
                res,
                400,
                "Message is required",
                [
                    {
                        field: "message",
                        message: "Message is required"
                    }
                ]
            );
        }

        if (message.trim().length > 5000) {
            return errorResponse(
                res,
                400,
                "Message cannot exceed 5000 characters",
                []
            );
        }

        const access = await checkTicketAccess(
            ticketId,
            req.user
        );

        if (!access.allowed) {
            return errorResponse(
                res,
                access.statusCode,
                access.message,
                []
            );
        }

        /*
         * Customer should not send message on closed ticket.
         */
        if (
            req.user.role === "customer" &&
            access.ticket.status === "Closed"
        ) {
            return errorResponse(
                res,
                400,
                "Cannot reply to a closed ticket",
                []
            );
        }

        const newMessage = await Message.create({
            ticketId,
            senderId: req.user.id,
            message: message.trim()
        });

        const populatedMessage =
            await Message.findById(
                newMessage._id
            ).populate(
                "senderId",
                "name email role"
            );

        return successResponse(
            res,
            201,
            "Message added successfully",
            populatedMessage
        );
    } catch (error) {
        console.error("Add message error:", error);

        return errorResponse(
            res,
            500,
            error.message || "Failed to add message",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| GET MESSAGES
|--------------------------------------------------------------------------
*/

const getMessages = async (req, res) => {
    try {
        const { ticketId } = req.params;

        if (!isValidObjectId(ticketId)) {
            return errorResponse(
                res,
                400,
                "Invalid ticket ID",
                []
            );
        }

        const access = await checkTicketAccess(
            ticketId,
            req.user
        );

        if (!access.allowed) {
            return errorResponse(
                res,
                access.statusCode,
                access.message,
                []
            );
        }

        const messages = await Message.find({
            ticketId,
            isDeleted: false
        })
            .populate(
                "senderId",
                "name email role"
            )
            .sort({ createdAt: 1 });

        return successResponse(
            res,
            200,
            "Messages fetched successfully",
            messages
        );
    } catch (error) {
        console.error("Get messages error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch messages",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE MESSAGE
|--------------------------------------------------------------------------
*/

const getMessage = async (req, res) => {
    try {
        const {
            ticketId,
            messageId
        } = req.params;

        if (
            !isValidObjectId(ticketId) ||
            !isValidObjectId(messageId)
        ) {
            return errorResponse(
                res,
                400,
                "Invalid ID",
                []
            );
        }

        const access = await checkTicketAccess(
            ticketId,
            req.user
        );

        if (!access.allowed) {
            return errorResponse(
                res,
                access.statusCode,
                access.message,
                []
            );
        }

        const message = await Message.findOne({
            _id: messageId,
            ticketId,
            isDeleted: false
        }).populate(
            "senderId",
            "name email role"
        );

        if (!message) {
            return errorResponse(
                res,
                404,
                "Message not found",
                []
            );
        }

        return successResponse(
            res,
            200,
            "Message fetched successfully",
            message
        );
    } catch (error) {
        console.error("Get message error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch message",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| UPDATE MESSAGE
|--------------------------------------------------------------------------
*/

const updateMessage = async (req, res) => {
    try {
        const {
            ticketId,
            messageId
        } = req.params;

        const { message } = req.body;

        if (
            !isValidObjectId(ticketId) ||
            !isValidObjectId(messageId)
        ) {
            return errorResponse(
                res,
                400,
                "Invalid ID",
                []
            );
        }

        if (!message || !message.trim()) {
            return errorResponse(
                res,
                400,
                "Message is required",
                []
            );
        }

        const access = await checkTicketAccess(
            ticketId,
            req.user
        );

        if (!access.allowed) {
            return errorResponse(
                res,
                access.statusCode,
                access.message,
                []
            );
        }

        const existingMessage =
            await Message.findOne({
                _id: messageId,
                ticketId,
                isDeleted: false
            });

        if (!existingMessage) {
            return errorResponse(
                res,
                404,
                "Message not found",
                []
            );
        }

        /*
         * Only message sender can edit.
         */
        if (
            existingMessage.senderId.toString() !==
            req.user.id.toString()
        ) {
            return errorResponse(
                res,
                403,
                "You can only edit your own message",
                []
            );
        }

        existingMessage.message = message.trim();
        existingMessage.updatedAt = new Date();

        await existingMessage.save();

        return successResponse(
            res,
            200,
            "Message updated successfully",
            existingMessage
        );
    } catch (error) {
        console.error("Update message error:", error);

        return errorResponse(
            res,
            500,
            "Failed to update message",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| DELETE MESSAGE
|--------------------------------------------------------------------------
*/

const deleteMessage = async (req, res) => {
    try {
        const {
            ticketId,
            messageId
        } = req.params;

        if (
            !isValidObjectId(ticketId) ||
            !isValidObjectId(messageId)
        ) {
            return errorResponse(
                res,
                400,
                "Invalid ID",
                []
            );
        }

        const message = await Message.findOne({
            _id: messageId,
            ticketId,
            isDeleted: false
        });

        if (!message) {
            return errorResponse(
                res,
                404,
                "Message not found",
                []
            );
        }

        if (
            message.senderId.toString() !==
                req.user.id.toString() &&
            req.user.role !== "admin"
        ) {
            return errorResponse(
                res,
                403,
                "You can only delete your own message",
                []
            );
        }

        message.isDeleted = true;
        message.updatedAt = new Date();

        await message.save();

        return successResponse(
            res,
            200,
            "Message deleted successfully",
            {}
        );
    } catch (error) {
        console.error("Delete message error:", error);

        return errorResponse(
            res,
            500,
            "Failed to delete message",
            []
        );
    }
};

module.exports = {
    addMessage,
    getMessages,
    getMessage,
    updateMessage,
    deleteMessage
};