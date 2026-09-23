const mongoose = require("mongoose");

const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Message = require("../models/Message");

const generateTicketNumber = require("../utils/ticketNumber");

const {
    successResponse,
    errorResponse
} = require("../utils/response");

const CATEGORIES = [
    "Order Issue",
    "Delivery Issue",
    "Product Issue",
    "Payment Issue",
    "Refund Issue",
    "Account Issue",
    "Other"
];

const PRIORITIES = [
    "Low",
    "Medium",
    "High",
    "Critical"
];

const STATUSES = [
    "Open",
    "Assigned",
    "In Progress",
    "Waiting for Customer",
    "Resolved",
    "Closed"
];

const STATUS_TRANSITIONS = {
    "Open": ["Assigned"],
    "Assigned": ["In Progress"],
    "In Progress": [
        "Waiting for Customer",
        "Resolved"
    ],
    "Waiting for Customer": ["In Progress"],
    "Resolved": ["Closed"],
    "Closed": []
};

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/*
|--------------------------------------------------------------------------
| CREATE TICKET
|--------------------------------------------------------------------------
*/

const createTicket = async (req, res) => {
    try {
        const {
            subject,
            description,
            category,
            priority,
            attachmentUrl
        } = req.body;

        const errors = [];

        if (!subject || !subject.trim()) {
            errors.push({
                field: "subject",
                message: "Subject is required"
            });
        }

        if (!description || !description.trim()) {
            errors.push({
                field: "description",
                message: "Description is required"
            });
        }

        if (!category) {
            errors.push({
                field: "category",
                message: "Category is required"
            });
        } else if (!CATEGORIES.includes(category)) {
            errors.push({
                field: "category",
                message: "Invalid category"
            });
        }

        if (!priority) {
            errors.push({
                field: "priority",
                message: "Priority is required"
            });
        } else if (!PRIORITIES.includes(priority)) {
            errors.push({
                field: "priority",
                message: "Invalid priority"
            });
        }

        if (subject && subject.trim().length > 200) {
            errors.push({
                field: "subject",
                message: "Subject cannot exceed 200 characters"
            });
        }

        if (description && description.trim().length > 5000) {
            errors.push({
                field: "description",
                message: "Description cannot exceed 5000 characters"
            });
        }

        if (errors.length > 0) {
            return errorResponse(
                res,
                400,
                "Validation failed",
                errors
            );
        }

        const ticketNumber = await generateTicketNumber();

        const ticket = await Ticket.create({
            ticketNumber,
            subject: subject.trim(),
            description: description.trim(),
            category,
            priority,
            attachmentUrl: attachmentUrl || null,
            customerId: req.user.id,
            status: "Open"
        });

        return successResponse(
            res,
            201,
            "Ticket created successfully",
            ticket
        );
    } catch (error) {
        console.error("Create ticket error:", error);

        return errorResponse(
            res,
            500,
            "Failed to create ticket",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| GET TICKETS
|--------------------------------------------------------------------------
*/

const getTickets = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            priority,
            category,
            startDate,
            endDate,
            assignedAgentId
        } = req.query;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            100
        );

        const filter = {
            isDeleted: false
        };

        /*
         * CUSTOMER:
         * Can only see own tickets.
         */
        if (req.user.role === "customer") {
            filter.customerId = req.user.id;
        }

        /*
         * AGENT:
         * Can only see tickets assigned to them.
         */
        if (req.user.role === "agent") {
            filter.assignedAgentId = req.user.id;
        }

        /*
         * ADMIN:
         * Can see everything.
         */

        if (search && search.trim()) {
            filter.$or = [
                {
                    ticketNumber: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },
                {
                    subject: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                }
            ];
        }

        if (status) {
            if (!STATUSES.includes(status)) {
                return errorResponse(
                    res,
                    400,
                    "Invalid status",
                    [
                        {
                            field: "status",
                            message: "Invalid status"
                        }
                    ]
                );
            }

            filter.status = status;
        }

        if (priority) {
            if (!PRIORITIES.includes(priority)) {
                return errorResponse(
                    res,
                    400,
                    "Invalid priority",
                    [
                        {
                            field: "priority",
                            message: "Invalid priority"
                        }
                    ]
                );
            }

            filter.priority = priority;
        }

        if (category) {
            if (!CATEGORIES.includes(category)) {
                return errorResponse(
                    res,
                    400,
                    "Invalid category",
                    [
                        {
                            field: "category",
                            message: "Invalid category"
                        }
                    ]
                );
            }

            filter.category = category;
        }

        if (assignedAgentId) {
            if (!validateObjectId(assignedAgentId)) {
                return errorResponse(
                    res,
                    400,
                    "Invalid agent ID",
                    []
                );
            }

            filter.assignedAgentId = assignedAgentId;
        }

        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                const start = new Date(startDate);

                if (Number.isNaN(start.getTime())) {
                    return errorResponse(
                        res,
                        400,
                        "Invalid startDate",
                        []
                    );
                }

                filter.createdAt.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (Number.isNaN(end.getTime())) {
                    return errorResponse(
                        res,
                        400,
                        "Invalid endDate",
                        []
                    );
                }

                end.setHours(23, 59, 59, 999);

                filter.createdAt.$lte = end;
            }
        }

        const skip = (pageNumber - 1) * limitNumber;

        const [tickets, total] = await Promise.all([
            Ticket.find(filter)
                .populate(
                    "customerId",
                    "name email role"
                )
                .populate(
                    "assignedAgentId",
                    "name email role"
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Ticket.countDocuments(filter)
        ]);

        return successResponse(
            res,
            200,
            "Tickets fetched successfully",
            {
                tickets,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(
                        total / limitNumber
                    )
                }
            }
        );
    } catch (error) {
        console.error("Get tickets error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch tickets",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE TICKET
|--------------------------------------------------------------------------
*/

const getTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        if (!validateObjectId(ticketId)) {
            return errorResponse(
                res,
                400,
                "Invalid ticket ID",
                []
            );
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            isDeleted: false
        })
            .populate(
                "customerId",
                "name email role"
            )
            .populate(
                "assignedAgentId",
                "name email role"
            );

        if (!ticket) {
            return errorResponse(
                res,
                404,
                "Ticket not found",
                []
            );
        }

        if (
            req.user.role === "customer" &&
            ticket.customerId._id.toString() !==
                req.user.id.toString()
        ) {
            return errorResponse(
                res,
                403,
                "You do not have access to this ticket",
                []
            );
        }

        if (
            req.user.role === "agent" &&
            (
                !ticket.assignedAgentId ||
                ticket.assignedAgentId._id.toString() !==
                    req.user.id.toString()
            )
        ) {
            return errorResponse(
                res,
                403,
                "You do not have access to this ticket",
                []
            );
        }

        return successResponse(
            res,
            200,
            "Ticket fetched successfully",
            ticket
        );
    } catch (error) {
        console.error("Get ticket error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch ticket",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| GET TICKET DETAILS
|--------------------------------------------------------------------------
*/

const getTicketDetails = async (req, res) => {
    try {
        const { ticketId } = req.params;

        if (!validateObjectId(ticketId)) {
            return errorResponse(
                res,
                400,
                "Invalid ticket ID",
                []
            );
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            isDeleted: false
        })
            .populate(
                "customerId",
                "name email role"
            )
            .populate(
                "assignedAgentId",
                "name email role"
            );

        if (!ticket) {
            return errorResponse(
                res,
                404,
                "Ticket not found",
                []
            );
        }

        if (
            req.user.role === "customer" &&
            ticket.customerId._id.toString() !==
                req.user.id.toString()
        ) {
            return errorResponse(
                res,
                403,
                "You do not have access to this ticket",
                []
            );
        }

        if (
            req.user.role === "agent" &&
            (
                !ticket.assignedAgentId ||
                ticket.assignedAgentId._id.toString() !==
                    req.user.id.toString()
            )
        ) {
            return errorResponse(
                res,
                403,
                "You do not have access to this ticket",
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
            "Ticket details fetched successfully",
            {
                ticket,
                messages
            }
        );
    } catch (error) {
        console.error("Get ticket details error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch ticket details",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| UPDATE TICKET
|--------------------------------------------------------------------------
*/

const updateTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        if (!validateObjectId(ticketId)) {
            return errorResponse(
                res,
                400,
                "Invalid ticket ID",
                []
            );
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            isDeleted: false
        });

        if (!ticket) {
            return errorResponse(
                res,
                404,
                "Ticket not found",
                []
            );
        }

        if (
            req.user.role === "customer" &&
            ticket.customerId.toString() !==
                req.user.id.toString()
        ) {
            return errorResponse(
                res,
                403,
                "You do not have access to this ticket",
                []
            );
        }

        if (
            req.user.role === "agent" &&
            (
                !ticket.assignedAgentId ||
                ticket.assignedAgentId.toString() !==
                    req.user.id.toString()
            )
        ) {
            return errorResponse(
                res,
                403,
                "You do not have access to this ticket",
                []
            );
        }

        const {
            subject,
            description,
            category,
            priority,
            attachmentUrl
        } = req.body;

        const errors = [];

        if (
            subject !== undefined &&
            (!subject.trim() || subject.trim().length < 3)
        ) {
            errors.push({
                field: "subject",
                message: "Subject must be at least 3 characters"
            });
        }

        if (
            description !== undefined &&
            (!description.trim() || description.trim().length < 5)
        ) {
            errors.push({
                field: "description",
                message: "Description must be at least 5 characters"
            });
        }

        if (
            category !== undefined &&
            !CATEGORIES.includes(category)
        ) {
            errors.push({
                field: "category",
                message: "Invalid category"
            });
        }

        if (
            priority !== undefined &&
            !PRIORITIES.includes(priority)
        ) {
            errors.push({
                field: "priority",
                message: "Invalid priority"
            });
        }

        if (errors.length > 0) {
            return errorResponse(
                res,
                400,
                "Validation failed",
                errors
            );
        }

        if (subject !== undefined) {
            ticket.subject = subject.trim();
        }

        if (description !== undefined) {
            ticket.description = description.trim();
        }

        if (category !== undefined) {
            ticket.category = category;
        }

        if (priority !== undefined) {
            ticket.priority = priority;
        }

        if (attachmentUrl !== undefined) {
            ticket.attachmentUrl =
                attachmentUrl || null;
        }

         

        await ticket.save();

        return successResponse(
            res,
            200,
            "Ticket updated successfully",
            ticket
        );
    } catch (error) {
        console.error("Update ticket error:", error);

        return errorResponse(
            res,
            500,
            "Failed to update ticket",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| DELETE TICKET - SOFT DELETE
|--------------------------------------------------------------------------
*/

const deleteTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        if (!validateObjectId(ticketId)) {
            return errorResponse(
                res,
                400,
                "Invalid ticket ID",
                []
            );
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            isDeleted: false
        });

        if (!ticket) {
            return errorResponse(
                res,
                404,
                "Ticket not found",
                []
            );
        }

        if (
            req.user.role === "customer" &&
            ticket.customerId.toString() !==
                req.user.id.toString()
        ) {
            return errorResponse(
                res,
                403,
                "You do not have access to this ticket",
                []
            );
        }

        if (
            req.user.role === "agent"
        ) {
            return errorResponse(
                res,
                403,
                "Agent cannot delete tickets",
                []
            );
        }

        ticket.isDeleted = true;
         

        await ticket.save();

        return successResponse(
            res,
            200,
            "Ticket deleted successfully",
            {}
        );
    } catch (error) {
        console.error("Delete ticket error:", error);

        return errorResponse(
            res,
            500,
            "Failed to delete ticket",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| ASSIGN TICKET
|--------------------------------------------------------------------------
*/

const assignTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { agentId } = req.body;

        if (!validateObjectId(ticketId)) {
            return errorResponse(
                res,
                400,
                "Invalid ticket ID",
                []
            );
        }

        if (!agentId) {
            return errorResponse(
                res,
                400,
                "agentId is required",
                [
                    {
                        field: "agentId",
                        message: "Agent ID is required"
                    }
                ]
            );
        }

        if (!validateObjectId(agentId)) {
            return errorResponse(
                res,
                400,
                "Invalid agent ID",
                []
            );
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            isDeleted: false
        });

        if (!ticket) {
            return errorResponse(
                res,
                404,
                "Ticket not found",
                []
            );
        }

        const agent = await User.findOne({
            _id: agentId,
            role: "agent",
            isActive: true
        });

        if (!agent) {
            return errorResponse(
                res,
                404,
                "Active support agent not found",
                []
            );
        }

        ticket.assignedAgentId = agent._id;

        if (ticket.status === "Open") {
            ticket.status = "Assigned";
        }

         

        await ticket.save();

        const updatedTicket = await Ticket.findById(
            ticket._id
        )
            .populate(
                "customerId",
                "name email role"
            )
            .populate(
                "assignedAgentId",
                "name email role"
            );

        return successResponse(
            res,
            200,
            "Ticket assigned successfully",
            updatedTicket
        );
    } catch (error) {
        console.error("Assign ticket error:", error);

        return errorResponse(
            res,
            500,
            "Failed to assign ticket",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| UNASSIGN TICKET
|--------------------------------------------------------------------------
*/

const unassignTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        if (!validateObjectId(ticketId)) {
            return errorResponse(
                res,
                400,
                "Invalid ticket ID",
                []
            );
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            isDeleted: false
        });

        if (!ticket) {
            return errorResponse(
                res,
                404,
                "Ticket not found",
                []
            );
        }

        if (!ticket.assignedAgentId) {
            return errorResponse(
                res,
                400,
                "Ticket is not assigned to any agent",
                []
            );
        }

        ticket.assignedAgentId = null;

        if (
            ticket.status === "Assigned"
        ) {
            ticket.status = "Open";
        }

         

        await ticket.save();

        return successResponse(
            res,
            200,
            "Ticket unassigned successfully",
            ticket
        );
    } catch (error) {
        console.error("Unassign ticket error:", error);

        return errorResponse(
            res,
            500,
            "Failed to unassign ticket",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| CHANGE STATUS
|--------------------------------------------------------------------------
*/

const changeStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;

        if (!validateObjectId(ticketId)) {
            return errorResponse(
                res,
                400,
                "Invalid ticket ID",
                []
            );
        }

        if (!status) {
            return errorResponse(
                res,
                400,
                "Status is required",
                []
            );
        }

        if (!STATUSES.includes(status)) {
            return errorResponse(
                res,
                400,
                "Invalid status",
                []
            );
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            isDeleted: false
        });

        if (!ticket) {
            return errorResponse(
                res,
                404,
                "Ticket not found",
                []
            );
        }

        if (
            req.user.role === "agent" &&
            (
                !ticket.assignedAgentId ||
                ticket.assignedAgentId.toString() !==
                    req.user.id.toString()
            )
        ) {
            return errorResponse(
                res,
                403,
                "Only the assigned agent can change this ticket status",
                []
            );
        }

        if (ticket.status === status) {
            return errorResponse(
                res,
                400,
                "Ticket is already in this status",
                []
            );
        }

        const allowedTransitions =
            STATUS_TRANSITIONS[ticket.status] || [];

        if (!allowedTransitions.includes(status)) {
            return errorResponse(
                res,
                400,
                `Cannot change status from ${ticket.status} to ${status}`,
                []
            );
        }

        if (
            status === "Assigned" &&
            !ticket.assignedAgentId
        ) {
            return errorResponse(
                res,
                400,
                "Ticket must be assigned before changing to Assigned status",
                []
            );
        }

        ticket.status = status;
         

        await ticket.save();

        return successResponse(
            res,
            200,
            "Ticket status updated successfully",
            ticket
        );
    } catch (error) {
        console.error("Change status error:", error);

        return errorResponse(
            res,
            500,
            "Failed to change ticket status",
            []
        );
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicket,
    getTicketDetails,
    updateTicket,
    deleteTicket,
    assignTicket,
    unassignTicket,
    changeStatus
};