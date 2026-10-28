const validateRequest= require("../middleware/validateRequest");
const{registerSchema, loginSchema,}= require("../validators/authValidator");

const express = require("express");
const router = express.Router();

const{register,login,getMe,updateUserRole,firebaseLogin}=require("../controllers/authController");

const{protect,adminOnly} = require("../middleware/authMiddleware");
router.post("/register",validateRequest(registerSchema),register);
router.post("/login",validateRequest(loginSchema),login);
router.post("/firebase", firebaseLogin);
router.get("/me",protect,getMe);
router.patch(
  "/users/:userId/role",
  protect,
  adminOnly,
  updateUserRole
);
module.exports = router;