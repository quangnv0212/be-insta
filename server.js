const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
const Conversation = require("./models/Conversation");
dotenv.config();

const app = express();
const httpServer = createServer(app);
app.use(express.json());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
//routes
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

//database
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to database");
  } catch (error) {
    console.log(error);
  }
};
connectDatabase();
const PORT = 8000;
const io = new Server(httpServer, { cors: { origin: "http://localhost:3000" } });
const users = {}
io.on("connection", (socket) => {
  const user_id=socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id,
  }
  socket.on("send_message", async (data) => {
   await new Conversation({
      sender_id: data.payload.sender_id,
      receiver_id: data.payload.receiver_id,
      content: data.payload.content,
    }).save()
   })
  socket.on("disconnect", () => {
    delete users[user_id]
    console.log(socket.id, "disconnected")
  })


});
httpServer.listen(PORT, () => {
  console.log(`server is running on port ${PORT}..`);
});
