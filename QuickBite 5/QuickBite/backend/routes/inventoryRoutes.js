const express = require("express");
const router = express.Router();
const{getAllInventory,getInventoryByFood,restockInventory,updateInventoryQuantity,getLowStockItems,}= require("../controllers/inventoryController");

const{protect}= require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.use(protect, adminOnly);

router.get("/", getAllInventory);
router.get("/low-stock", getLowStockItems);
router.get("/food/:foodId", getInventoryByFood);
router.post("/restock", restockInventory);
router.patch("/food/:foodId", updateInventoryQuantity);

module.exports = router;