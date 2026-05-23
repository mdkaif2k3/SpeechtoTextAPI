const express = require("express");
const router = express.Router();
const Transcription = require("../models/Transcription");
const upload = require("../middleware/upload");
const fs = require("fs");
const deepgram = require("../config/deepgram");

router.post("/", upload.single("media"), async (req, res) => {
  try {
    const audioBuffer = fs.readFileSync(req.file.path);
    const response = await deepgram.listen.v1.media.transcribeFile(
      audioBuffer,
      {
        model: "nova-3",
        smart_format: true,
      }
    );

    const transcriptText = response.results.channels[0].alternatives[0].transcript;

    const newFile = new Transcription({
      filename: req.file.originalname,
      filepath: req.file.path,
      transcription: transcriptText,
    });

    await newFile.save();

    res.json({
      message: "Transcription successful",
      transcript: transcriptText,
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