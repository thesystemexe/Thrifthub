const mongoose = require("mongoose");

const connectDB = async () => {
  // remove the try and catch block if u r handling the thing with the process.on in server.js
  // error will be caught there
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("database is connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
