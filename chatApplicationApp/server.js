const app = require("./app");
const path = require("path");
const http = require("http");
const dotenv = require("dotenv");
const cron = require("node-cron");
const mongoose = require("mongoose");
const socketapi = require("./utils/socketsIo");

dotenv.config({ path: "config.env" });

const server = http.createServer(app);
const port = process.env.PORT;
const DB = process.env.DB;

mongoose
  .connect(DB)
  .then((con) => console.log("Connetion established successfully right now !"))
  .catch((con) => console.log("Error occured during connection !", con));

console.log("Hy! Live dployed to run after 1 minute.");
socketapi.io.attach(server, {
  cors: {
    origin: "*",
  },
});
server.listen(port, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`Server is running on port ${port} in development mode.`);
  } else {
    console.log(`Server is running on port ${port} in production mode.`);
  }
});

console.log("JUST CHECKING THE GIHUB ACTIONS");
// http://ec2-3-129-194-58.us-east-2.compute.amazonaws.com/
