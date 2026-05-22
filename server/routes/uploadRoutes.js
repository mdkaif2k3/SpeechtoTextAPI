const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/", upload.single("media"), (req, res) => {
  res.json({
    message: "File uploaded successfully",
    file: req.file,
  });
});

module.exports = router;