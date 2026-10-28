const express = require("express");
const router = express.Router();
const{adminOnly}= require("../middleware/adminMiddleware");

const{
     getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getDeliveryPartners,
}= require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.patch("/me/password", protect, changeMyPassword);
router.get("/delivery-partners", protect, adminOnly, getDeliveryPartners);

module.exports = router;