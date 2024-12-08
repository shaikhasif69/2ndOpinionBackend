const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authenticate = require("../middleware/authentication");


// Get or create chat between a user and a doctor
// router.get("/:userId/:doctorId",authenticate, chatController.getOrCreateChat);

router.post("/:chatId/message",authenticate, chatController.sendMessage);

router.get("/:chatId",authenticate, chatController.getMessages);

module.exports = router;
