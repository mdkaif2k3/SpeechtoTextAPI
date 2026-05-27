const mongoose = require("mongoose");

const transcriptionSchema = new mongoose.Schema({

  filename: {
    type: String,
    required: true,
  },

  filepath: {
    type: String,
    required: true,
  },

  transcription: {
    type: String,
    default: "",
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },

  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  },

});

module.exports = mongoose.model(
  "Transcription",
  transcriptionSchema
);