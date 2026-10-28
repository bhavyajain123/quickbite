const express = require("express");
const router = express.Router();

const{
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
     clearCart,
}= require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");
router.use(protect);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/item/:foodId", updateCartItem);
router.delete("/item/:foodId", removeCartItem);
router.delete("/clear", clearCart);

module.exports = router;