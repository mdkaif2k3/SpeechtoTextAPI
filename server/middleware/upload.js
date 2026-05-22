const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
    "audio/x-wav",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only audio and video files are allowed"), false);
  }
};


const upload = multer({ 
    storage,
    fileFilter, 
});

module.exports = upload;