const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// Get or create chat between a user and a doctor
router.get("/:userId/:doctorId", chatController.getOrCreateChat);

router.post("/:chatId/message", chatController.sendMessage);

router.get("/:chatId", chatController.getMessages);

module.exports = router;
