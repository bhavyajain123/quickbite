const express = require("express");
const router = express.Router();
const {createCoupon, validateCoupon,getCoupons, deleteCoupon,}= require("../controllers/couponController");


const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
router.post("/validate", protect, validateCoupon);
router.post("/", protect, adminOnly, createCoupon);
router.get("/", protect, adminOnly, getCoupons);
router.delete("/:id", protect, adminOnly, deleteCoupon);

module.exports = router;