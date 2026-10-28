
const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/chat", aiController.chat);
router.get("/recommendations", aiController.recommend);
router.post("/group-order", aiController.groupOrder);
router.post("/review-analysis", aiController.reviewAnalysis);

module.exports = router;