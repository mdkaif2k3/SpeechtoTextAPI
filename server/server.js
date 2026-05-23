const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");
})
.catch((error) => {
  console.log(error);
});

app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.listen(5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});