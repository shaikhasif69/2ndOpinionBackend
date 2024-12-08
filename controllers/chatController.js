const mongoose = require("mongoose");
const Chat = require("../models/chatSchema");
const User = require("../models/userSchema");
const Doctor = require("../models/doctorSchema");

// exports.getOrCreateChat = async (req, res) => {
//   console.log("helllo there this working ? ");
//   const { userId, doctorId } = req.params;

//   try {
//     let chat = await Chat.findOne({
//       participants: {
//         $all: [
//           new mongoose.Types.ObjectId(userId),
//           new mongoose.Types.ObjectId(doctorId),
//         ],
//       },
//     });

//     if (!chat) {
//       chat = new Chat({
//         participants: [
//           new mongoose.Types.ObjectId(userId),
//           new mongoose.Types.ObjectId(doctorId),
//         ],
//       });
//       await chat.save();
//     }

//     res.json(chat);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.findOrCreateChat = async (userId, doctorId) => {
  try {
    console.log("userId: wth", userId);
    console.log("docId: ", doctorId);
    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(doctorId)
    ) {
      throw new Error("Invalid userId or doctorId");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    // Find the chat
    let chat = await Chat.findOne({
      participants: { $all: [userObjectId, doctorObjectId] },
    });

    // Create a new chat if not found
    if (!chat) {
      chat = new Chat({
        participants: [userObjectId, doctorObjectId],
        messages: [],
      });
      await chat.save();
    }

    return chat;
  } catch (error) {
    throw error;
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { senderId, senderModel, text } = req.body;

  // Validate chatId
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ error: "Invalid chat ID" });
  }

  // Validate senderId
  if (!mongoose.Types.ObjectId.isValid(senderId)) {
    return res.status(400).json({ error: "Invalid sender ID" });
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  const newMessage = {
    sender: new mongoose.Types.ObjectId(senderId), // Corrected
    senderModel,
    text,
  };

  chat.messages.push(newMessage);
  await chat.save();

  res.json(newMessage);
};

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ error: "Invalid chatId format" });
  }

  try {
    const chatObjectId = new mongoose.Types.ObjectId(chatId);

    const chat = await Chat.findById(chatObjectId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat.messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
