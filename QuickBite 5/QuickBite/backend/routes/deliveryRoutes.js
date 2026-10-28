const express = require("express");
const router = express.Router();

const{assignDelivery,getDeliveryByOrder,updateDeliveryStatus,updateDeliveryLocation,getAllDeliveries,}= require("../controllers/deliveryController");

const{protect}= require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
router.use(protect);

router.post("/assign", adminOnly, assignDelivery);
router.get("/all", adminOnly, getAllDeliveries);
router.get("/order/:orderId", getDeliveryByOrder);
router.patch("/:id/status", updateDeliveryStatus);
router.patch("/:id/location", updateDeliveryLocation);

module.exports = router;