const express = require('express');
const connectDB = require('./db'); // Import the database connection
const doctorRoutes = require('./routes/Doctor Routes/doctorRoutes');
const userRoutes = require('./routes/User Routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes'); // Import the chat routes
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = 3000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server);

// Middleware
app.use(express.json());
connectDB();

// Routes
app.use('/api/doctor', doctorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes); // Add the chat routes

// Default route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Socket.io configuration
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { chatId, senderId, senderModel, text } = data;

    const newMessage = {
      sender: senderId,
      senderModel: senderModel,
      text: text,
    };

    const Chat = require('./models/Chat'); // Ensure the Chat model is required here
    const chat = await Chat.findById(chatId);
    chat.messages.push(newMessage);
    await chat.save();

    io.to(chatId).emit('newMessage', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
