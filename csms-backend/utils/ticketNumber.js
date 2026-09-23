const Ticket = require("../models/Ticket");

const generateTicketNumber = async () => {
    const lastTicket = await Ticket.findOne({})
        .sort({ createdAt: -1 })
        .select("ticketNumber");

    let nextNumber = 1001;

    if (lastTicket && lastTicket.ticketNumber) {
        const currentNumber = parseInt(
            lastTicket.ticketNumber.replace("TKT-", ""),
            10
        );

        if (!Number.isNaN(currentNumber)) {
            nextNumber = currentNumber + 1;
        }
    }

    return `TKT-${nextNumber}`;
};

module.exports = generateTicketNumber;