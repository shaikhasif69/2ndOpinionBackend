const express = require("express");
const http = require("http");
const socketHandler = require("../2ndOpinionBackend/socket");
const connectDB = require("./db");
const doctorRoutes = require("./routes/doctorRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const fileRoutes = require("./routes/filesRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

socketHandler(server);

app.use(express.json());
connectDB();

// Routes
app.use("/api/doctor", doctorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/consult", consultationRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
