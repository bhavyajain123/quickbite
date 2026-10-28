const validateRequest = require("../middleware/validateRequest");
const{createFoodSchema, updateFoodSchema,}= require("../validators/foodValidator");
const express = require("express");
const upload= require("../middleware/uploadMiddleware");
const router = express.Router();

const{getFoods,getFoodById,getFoodsByRestaurant,createFood,updateFood,deleteFood, searchFoods,}= require("../controllers/foodController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
router.get("/search", searchFoods);
router.get("/restaurant/:restaurantId", getFoodsByRestaurant);
router.get("/", getFoods);
router.get("/:id", getFoodById);
router.post("/", protect, adminOnly,upload.single("image"),validateRequest(createFoodSchema), createFood);
router.put("/:id", protect, adminOnly,upload.single("image"),validateRequest(updateFoodSchema), updateFood);
router.delete("/:id", protect, adminOnly, deleteFood);


module.exports = router;