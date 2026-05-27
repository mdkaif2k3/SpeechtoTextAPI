const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const setupRealtime = require("./socket");

const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");
})
.catch((error) => {
  console.log(error);
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

setupRealtime(io);

app.get("/", (req, res) => {

  res.send("Backend Running");

});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});