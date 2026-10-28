const express = require("express");
const router = express.Router();
const{getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
     searchRestaurants,
}=require("../controllers/restaurantController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
router.get("/search", searchRestaurants);
router.get("/", getRestaurants);
router.get("/:id",getRestaurantById);
router.post("/", protect, adminOnly, createRestaurant);
router.put("/:id", protect, adminOnly, updateRestaurant);
router.delete("/:id", protect, adminOnly, deleteRestaurant);

module.exports = router;