const express =require("express");
const router= express.Router();
const upload =require("../middleware/uploadMiddleware");
const{uploadImageController,}=require("../controllers/uploadController");

router.post("/", upload.single("image"), uploadImageController);

module.exports = router;