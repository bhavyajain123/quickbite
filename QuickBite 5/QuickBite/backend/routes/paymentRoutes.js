const validateRequest= require("../middleware/validateRequest");
const{createPaymentSchema}= require("../validators/paymentValidator");
const express = require("express");
const router = express.Router();

const{createPayment,confirmDummyUpi,getPaymentByOrder,}= require("../controllers/paymentController");

const{protect}= require("../middleware/authMiddleware");
router.use(protect);
router.post("/",validateRequest(createPaymentSchema), createPayment);
router.post("/:paymentId/dummy-confirm", confirmDummyUpi);
router.get("/order/:orderId", getPaymentByOrder);

module.exports = router;
