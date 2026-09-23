const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createTicket,
    getTickets,
    getTicket,
    getTicketDetails,
    updateTicket,
    deleteTicket,
    assignTicket,
    unassignTicket,
    changeStatus
} = require("../controllers/ticketController");

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    authenticate,
    authorizeRoles("customer"),
    createTicket
);

/*
|--------------------------------------------------------------------------
| LIST
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    authenticate,
    authorizeRoles("customer", "agent", "admin"),
    getTickets
);

/*
|--------------------------------------------------------------------------
| DETAILS
|--------------------------------------------------------------------------
*/

router.get(
    "/:ticketId/details",
    authenticate,
    authorizeRoles("customer", "agent", "admin"),
    getTicketDetails
);

/*
|--------------------------------------------------------------------------
| GET SINGLE
|--------------------------------------------------------------------------
*/

router.get(
    "/:ticketId",
    authenticate,
    authorizeRoles("customer", "agent", "admin"),
    getTicket
);

/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

router.put(
    "/:ticketId",
    authenticate,
    authorizeRoles("customer", "agent", "admin"),
    updateTicket
);

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

router.delete(
    "/:ticketId",
    authenticate,
    authorizeRoles("customer", "admin"),
    deleteTicket
);

/*
|--------------------------------------------------------------------------
| ASSIGN
|--------------------------------------------------------------------------
*/

router.patch(
    "/:ticketId/assign",
    // authenticate,
    // authorizeRoles("admin"),
    assignTicket
);

/*
|--------------------------------------------------------------------------
| UNASSIGN
|--------------------------------------------------------------------------
*/

router.patch(
    "/:ticketId/unassign",
    authenticate,
    authorizeRoles("admin"),
    unassignTicket
);

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

router.patch(
    "/:ticketId/status",
    authenticate,
    authorizeRoles("agent", "admin"),
    changeStatus
);

module.exports = router;