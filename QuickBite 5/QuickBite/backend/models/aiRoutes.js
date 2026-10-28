const express = require("express");
const router = express.Router();

const{chat,recommend}= require("../controllers/aiController");

router.post("/chat",chat);
router.get("/recommendations",recommend);

module.exports = router;