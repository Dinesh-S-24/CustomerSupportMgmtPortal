
const Ticket = require("../models/Ticket");

const {
    successResponse,
    errorResponse
} = require("../utils/response");

/*
|--------------------------------------------------------------------------
| SUMMARY
|--------------------------------------------------------------------------
*/

const getSummary = async (req, res) => {
    try {
        const tickets = await Ticket.find({
            isDeleted: false
        }).select("status");

        const summary = {
            totalTickets: tickets.length,
            openTickets: 0,
            assignedTickets: 0,
            inProgressTickets: 0,
            waitingTickets: 0,
            resolvedTickets: 0,
            closedTickets: 0
        };

        tickets.forEach((ticket) => {
            if (ticket.status === "Open") {
                summary.openTickets++;
            }

            if (ticket.status === "Assigned") {
                summary.assignedTickets++;
            }

            if (ticket.status === "In Progress") {
                summary.inProgressTickets++;
            }

            if (ticket.status === "Waiting for Customer") {
                summary.waitingTickets++;
            }

            if (ticket.status === "Resolved") {
                summary.resolvedTickets++;
            }

            if (ticket.status === "Closed") {
                summary.closedTickets++;
            }
        });

        return successResponse(
            res,
            200,
            "Dashboard summary fetched successfully",
            summary
        );
    } catch (error) {
        console.error("Dashboard summary error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch dashboard summary",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| STATUS COUNTS
|--------------------------------------------------------------------------
*/

const getStatusCounts = async (req, res) => {
    try {
        const tickets = await Ticket.find({
            isDeleted: false
        }).select("status");

        const statusMap = {};

        tickets.forEach((ticket) => {
            if (!statusMap[ticket.status]) {
                statusMap[ticket.status] = 0;
            }

            statusMap[ticket.status]++;
        });

        const data = Object.keys(statusMap)
            .map((status) => ({
                status,
                count: statusMap[status]
            }))
            .sort((a, b) => b.count - a.count);

        return successResponse(
            res,
            200,
            "Status counts fetched successfully",
            data
        );
    } catch (error) {
        console.error("Status counts error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch status counts",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| PRIORITY COUNTS
|--------------------------------------------------------------------------
*/

const getPriorityCounts = async (req, res) => {
    try {
        const tickets = await Ticket.find({
            isDeleted: false
        }).select("priority");

        const priorityMap = {};

        tickets.forEach((ticket) => {
            if (!priorityMap[ticket.priority]) {
                priorityMap[ticket.priority] = 0;
            }

            priorityMap[ticket.priority]++;
        });

        const data = Object.keys(priorityMap)
            .map((priority) => ({
                priority,
                count: priorityMap[priority]
            }))
            .sort((a, b) => b.count - a.count);

        return successResponse(
            res,
            200,
            "Priority counts fetched successfully",
            data
        );
    } catch (error) {
        console.error("Priority counts error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch priority counts",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| CATEGORY COUNTS
|--------------------------------------------------------------------------
*/

const getCategoryCounts = async (req, res) => {
    try {
        const tickets = await Ticket.find({
            isDeleted: false
        }).select("category");

        const categoryMap = {};

        tickets.forEach((ticket) => {
            if (!categoryMap[ticket.category]) {
                categoryMap[ticket.category] = 0;
            }

            categoryMap[ticket.category]++;
        });

        const data = Object.keys(categoryMap)
            .map((category) => ({
                category,
                count: categoryMap[category]
            }))
            .sort((a, b) => b.count - a.count);

        return successResponse(
            res,
            200,
            "Category counts fetched successfully",
            data
        );
    } catch (error) {
        console.error("Category counts error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch category counts",
            []
        );
    }
};

/*
|--------------------------------------------------------------------------
| AGENT COUNTS
|--------------------------------------------------------------------------
*/

const getAgentCounts = async (req, res) => {
    try {
        const tickets = await Ticket.find({
            isDeleted: false,
            assignedAgentId: {
                $ne: null
            }
        })
            .select("assignedAgentId")
            .populate("assignedAgentId", "name email");

        const agentMap = {};

        tickets.forEach((ticket) => {
            const agent = ticket.assignedAgentId;

            if (!agent) {
                return;
            }

            const agentId = agent._id.toString();

            if (!agentMap[agentId]) {
                agentMap[agentId] = {
                    agentId: agent._id,
                    agentName: agent.name,
                    agentEmail: agent.email,
                    count: 0
                };
            }

            agentMap[agentId].count++;
        });

        const data = Object.values(agentMap)
            .sort((a, b) => b.count - a.count);

        return successResponse(
            res,
            200,
            "Agent ticket counts fetched successfully",
            data
        );
    } catch (error) {
        console.error("Agent counts error:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch agent counts",
            []
        );
    }
};

module.exports = {
    getSummary,
    getStatusCounts,
    getPriorityCounts,
    getCategoryCounts,
    getAgentCounts
};
