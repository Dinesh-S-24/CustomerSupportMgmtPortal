const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getSummary,
    getStatusCounts,
    getPriorityCounts,
    getCategoryCounts,
    getAgentCounts
} = require("../controllers/dashboardController");

router.get(
    "/summary",
    // authenticate,
    // authorizeRoles("admin"),
    getSummary
);

router.get(
    "/status-counts",
    // authenticate,
    // authorizeRoles("admin"),
    getStatusCounts
);

router.get(
    "/priority-counts",
    // authenticate,
    // authorizeRoles("admin"),
    getPriorityCounts
);

router.get(
    "/category-counts",
    // authenticate,
    // authorizeRoles("admin"),
    getCategoryCounts
);

router.get(
    "/agent-counts",
    // authenticate,
    // authorizeRoles("admin"),
    getAgentCounts
);

module.exports = router;