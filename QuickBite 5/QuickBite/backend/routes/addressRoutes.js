const express = require("express");
const router = express.Router();

const { addAddress,getMyAddresses,updateAddress,deleteAddress,setDefaultAddress,}= require("../controllers/addressController");

const {protect}= require("../middleware/authMiddleware");

router.post("/", protect, addAddress);
router.get("/", protect, getMyAddresses);
router.patch("/:id/default", protect, setDefaultAddress);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);

module.exports = router;