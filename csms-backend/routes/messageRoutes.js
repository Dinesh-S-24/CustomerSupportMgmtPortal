const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    addMessage,
    getMessages,
    getMessage,
    updateMessage,
    deleteMessage
} = require("../controllers/messageController");

router.post(
    "/tickets/:ticketId/messages",
    authenticate,
    authorizeRoles("customer", "agent", "admin"),
    addMessage
);

router.get(
    "/tickets/:ticketId/messages",
    authenticate,
    authorizeRoles("customer", "agent", "admin"),
    getMessages
);

router.get(
    "/tickets/:ticketId/messages/:messageId",
    authenticate,
    authorizeRoles("customer", "agent", "admin"),
    getMessage
);

router.put(
    "/tickets/:ticketId/messages/:messageId",
    authenticate,
    authorizeRoles("customer", "agent", "admin"),
    updateMessage
);

router.delete(
    "/tickets/:ticketId/messages/:messageId",
    authenticate,
    authorizeRoles("customer", "agent", "admin"),
    deleteMessage
);

module.exports = router;