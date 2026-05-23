const express = require("express");
const router = express.Router();
const Transcription = require("../models/Transcription");
const upload = require("../middleware/upload");

router.post("/", upload.single("media"), async (req, res) => {
  try {

    const newFile = new Transcription({
      filename: req.file.originalname,
      filepath: req.file.path,
    });

    await newFile.save();

    res.json({
      message: "Media uploaded and saved successfully",
      file: newFile,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

  }
});

module.exports = router;