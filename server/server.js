require("dotenv").config();
const connectDB = require("./src/config/database");
const { server } = require("./src/app");

connectDB();

// Handle uncaught exception errors like trying to log something that is not defined
process.on("uncaughtException", (error) => {
  console.log(`Error: ${error.message}`);
  console.log("Server is shutting down due to uncaught exception errors");
  process.exit(1);
});

server.listen(4007, () => {
  console.log("Server is running on port no 4007");
});

// To handle the PromiseRejection error Like fault in MongoDb strings and all

// process.on("unhandledRejection", (error) => {
//   console.log(`Error: ${error.message}`);
//   console.log("Server is shutting down, due to unhandled promise rejection ");
//   server.close(()=>{
//     process.exit(1)
//   })
// });
