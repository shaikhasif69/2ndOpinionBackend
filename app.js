const express = require('express');
const connectDB = require('./db'); // Import the database connection
const doctorRoutes = require('./routes/Doctor Routes/doctorRoutes');
const userRoutes = require('./routes/User Routes/userRoutes');
const app = express();
const port = 3000;
app.use(express.json());
connectDB();
app.use('/api/doctor', doctorRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
