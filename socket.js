const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Chat = require("./models/chatSchema");
const User = require("./models/userSchema");
const Doctor = require("./models/doctorSchema");

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Replace with your frontend's URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    // ** Join Room for Doctor-User Chat **
    socket.on("joinChat", async ({ userId, doctorId }) => {
      try {
        // Define a unique room identifier for this chat
        const roomId = `${userId}_${doctorId}`;
        
        // Check if chat exists in the database or create a new one
        let chat = await Chat.findOne({
          participants: {
            $all: [
              new mongoose.Types.ObjectId(userId),
              new mongoose.Types.ObjectId(doctorId),
            ],
          },
        });

        if (!chat) {
          chat = new Chat({
            participants: [
              new mongoose.Types.ObjectId(userId),
              new mongoose.Types.ObjectId(doctorId),
            ],
          });
          await chat.save();
        }

        // Join the room
        socket.join(roomId);
        console.log(`User ${userId} and Doctor ${doctorId} joined room: ${roomId}`);

        // Emit previous messages for this chat room to the newly connected user/doctor
        socket.emit("previousMessages", chat.messages);

      } catch (error) {
        console.error("Error joining chat room:", error);
        socket.emit("error", { message: "Error joining chat room." });
      }
    });

    // ** Handle Sending a Message in Doctor-User Chat **
    socket.on("sendMessage", async ({ chatId, senderId, senderModel, text }) => {
      try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
          return socket.emit("error", { message: "Chat not found." });
        }

        const newMessage = {
          sender: new mongoose.Types.ObjectId(senderId),
          senderModel,
          text,
        };

        // Add the new message to the chat's messages array and save it
        chat.messages.push(newMessage);
        await chat.save();

        // Broadcast the new message to all participants in the room
        const roomId = chat.participants.map((id) => id.toString()).join("_");
        io.to(roomId).emit("newMessage", newMessage);

      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Error sending message." });
      }
    });

    // ** Handle File Sharing Permission Request (Placeholder) **
    socket.on("requestFileSharing", async ({ userId, doctorId }) => {
      try {
        const roomId = `${userId}_${doctorId}`;
        
        // Emit a request to the doctor for file sharing permission
        io.to(roomId).emit("fileSharingRequest", {
          message: `User ${userId} is requesting permission to share a file.`,
          userId,
        });

      } catch (error) {
        console.error("Error in file sharing request:", error);
        socket.emit("error", { message: "Error requesting file sharing." });
      }
    });

    // ** Handle Disconnection **
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

module.exports = socketHandler;
