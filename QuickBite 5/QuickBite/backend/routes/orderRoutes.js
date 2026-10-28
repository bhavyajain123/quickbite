const validateRequest= require("../middleware/validateRequest");
const{createOrderSchema}= require("../validators/orderValidator");
const express = require("express");
const router = express.Router();
const{ createOrder, getMyOrders,getAllOrders,updateOrderStatus,cancelMyOrder,getOrdersWithFilters,getAdminOrderId,updateDeliveryPartner,}= require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
router.post("/", protect,validateRequest(createOrderSchema), createOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.get("/admin/manage", protect, adminOnly, getOrdersWithFilters);
router.get("/admin/:id", protect, adminOnly, getAdminOrderId);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);
router.patch("/:id/cancel", protect, cancelMyOrder);
router.patch("/:id/delivery-partner", protect, adminOnly, updateDeliveryPartner);


module.exports = router;