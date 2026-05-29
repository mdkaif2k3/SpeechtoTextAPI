const deepgram = require("./config/deepgram");
const fs = require("fs");
const path = require("path")
const jwt = require("jsonwebtoken");
const Transcription = require("./models/Transcription")

function setupRealtime(io) {
  io.on("connection", async (socket) => {
    let isDeepgramReady = false;
    const token = await socket.handshake.auth.token;
    if (!token) {
      console.log("No token");
      return;
    }
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      console.log("Authenticated User:", userId);
    } catch (error) {
      console.log("Invalid token");
      return;
    }

    console.log("Client Connected");

    try {
        finalTranscript = "";
        audioChunks = [];
        isDeepgramReady = false;
        const connection = await deepgram.listen.v1.connect({
          model: "nova-3",
          language: "en-US",
          smart_format: true,
        });
        connection.on("open", () => {
          console.log("Deepgram Realtime Connected");
          isDeepgramReady = true;
        });

        connection.on("message", (data) => {
          console.log(data.type);
          try {
            if (data.type === "Results") {
              const transcript = data.channel.alternatives[0].transcript;
              if (transcript) {
                finalTranscript += " " + transcript;
                socket.emit("transcript", finalTranscript);
              }
            }

          } catch (error) {
            console.log(error);
          }
        });

        connection.on("close", () => {
          console.log("Deepgram Closed");
          isDeepgramReady = false;
        });

        connection.on("error", (error) => {
          console.log(error);
        });

      socket.on("audio-data", (data) => {
            if (isDeepgramReady) {
                console.log("Sending Audio");
                connection.sendMedia(data);
            }
            audioChunks.push(Buffer.from(data));
          });

      socket.on("stop-recording", async () => {
        console.log("Recording stopped");
        try {
            const filename = `recording-${Date.now()}.webm`;
            const filePath = path.join(
            __dirname,
            "uploads",
            filename
            );

            const audioBuffer = Buffer.concat(audioChunks);
            fs.writeFileSync(filePath, audioBuffer);
            console.log("Audio saved");

            const newTranscription = new Transcription({
            filename: filename,
            filepath: filePath,
            transcription: finalTranscript,
            user: userId,
            });

            await newTranscription.save();

            console.log("Transcript saved to MongoDB");
            audioChunks = [];
            finalTranscript = "";
        } catch (error) {
            console.log(error);
        }
      });

      socket.on("disconnect", () => {
        console.log("Client Disconnected");
        connection.close();
      });

      connection.connect();

    } catch (error) {
      console.log(error);
    }
  });
}

module.exports = setupRealtime;