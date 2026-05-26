const deepgram = require("./config/deepgram");
const fs = require("fs");
const path = require("path")
const Transcription = require("./models/Transcription")

function setupRealtime(io) {
  let isDeepgramReady = false;
  io.on("connection", async (socket) => {

    console.log("Client Connected");
    let audioChunks = [];
    let finalTranscript = "";

    try {

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
      });

      connection.on("error", (error) => {
        console.log(error);
      });

      socket.on("audio-data", (data) => {
        console.log("Audio chunk received");
        if (isDeepgramReady) {
            connection.sendMedia(data);
        }
        audioChunks.push(Buffer.from(data))
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
            });

            await newTranscription.save();

            console.log("Transcript saved to MongoDB");
            connection.close();
            isDeepgramReady = false;
            audioChunks = [];
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