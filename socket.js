const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Chat = require("./models/chatSchema");
const User = require("./models/userSchema");
const Doctor = require("./models/doctorSchema");
const chatController = require("./controllers/chatController");

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      // origin: ["http://localhost:19000", "http://<flutter_device_ip>:<port>"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", async ({ userId, doctorId }) => {
      try {
        console.log("Trying to join chat..");
        console.log("userId: wth", userId);
        console.log("docId : ", doctorId);

        // Use the controller function to find or create the chat
        const chat = await chatController.findOrCreateChat(userId, doctorId);

        const roomId = `${userId}_${doctorId}`;
        socket.join(roomId);

        console.log(
          `User ${userId} and Doctor ${doctorId} joined room: ${roomId}`
        );

        // Emit previous messages and chatId to the client
        socket.emit("previousMessages", {
          chatId: chat._id,
          messages: chat.messages,
        });
      } catch (error) {
        console.error("Error joining chat room:", error);
        socket.emit("error", {
          message: error.message || "Error joining chat room.",
        });
      }
    });

    socket.on(
      "sendMessage",
      async ({ chatId, senderId, senderModel, text }) => {
        try {
          console.log(
            `Received message: chatId=${chatId}, senderId=${senderId}, text=${text}`
          );

          const chat = await Chat.findById(chatId);

          if (!chat) {
            console.error("Chat not found.");
            return socket.emit("error", { message: "Chat not found." });
          }

          const newMessage = {
            sender: new mongoose.Types.ObjectId(senderId),
            senderModel,
            text,
            timestamp: new Date(),
          };

          chat.messages.push(newMessage);
          await chat.save();

          const roomId = chat.participants.map((id) => id.toString()).join("_");

          console.log(`Broadcasting new message to room: ${roomId}`);
          // Broadcast the new message to everyone in the room, including the sender
          io.to(roomId).emit("newMessage", {
            senderId,
            senderModel,
            text,
            timestamp: newMessage.timestamp,
          });
        } catch (error) {
          console.error("Error handling sendMessage:", error);
          socket.emit("error", { message: "Error handling sendMessage." });
        }
      }
    );
    socket.on("requestFileSharing", async ({ userId, doctorId }) => {
      try {
        const roomId = `${userId}_${doctorId}`;

        io.to(roomId).emit("fileSharingRequest", {
          message: `User ${userId} is requesting permission to share a file.`,
          userId,
        });
      } catch (error) {
        console.error("Error in file sharing request:", error);
        socket.emit("error", { message: "Error requesting file sharing." });
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });

    socket.on("connect", () => {
      console.log("A user is connected");
    });
  });
};

module.exports = socketHandler;
