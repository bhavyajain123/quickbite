const express =require("express");
const router = express.Router();

const dashboardController = require("../controllers/adminDashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


router.get("/overview",authMiddleware.protect, adminMiddleware.adminOnly, dashboardController.getDashboardOverview);


module.exports = router;