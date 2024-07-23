const mongoose = require("mongoose");

const dbURI =
  "mongodb+srv://theshaikhasif03:MXwskheDHJVVEMJX@cluster1.gvqntbs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;
