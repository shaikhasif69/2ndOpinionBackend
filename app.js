const express = require('express');
const connectDB = require('./db');
const doctorRoutes = require('./routes/Doctor Routes/doctorRoutes');
const userRoutes = require('./routes/User Routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const fileRoutes = require('./routes/filesRoutes'); 
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const port = 3000;

const server = http.createServer(app);

const io = socketIo(server);

app.use(express.json());
connectDB();

// Routes
app.use('/api/doctor', doctorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes); // Add the chat routes
app.use('/api/file', fileRoutes); 

// Default route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

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

    const Chat = require('./models/Chat'); 
    const chat = await Chat.findById(chatId);
    chat.messages.push(newMessage);
    await chat.save();

    io.to(chatId).emit('newMessage', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
