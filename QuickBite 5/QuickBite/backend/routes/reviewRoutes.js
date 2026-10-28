const express = require("express");
const router  = express.Router();
const{ createReview,getRestaurantReviews, deleteMyReview,}= require("../controllers/reviewController");

const{protect}= require("../middleware/authMiddleware");
router.get("/restaurant/:restaurantId",getRestaurantReviews);
router.post("/", protect, createReview);
router.delete("/:id", protect, deleteMyReview);

module.exports = router;