import { useState, useRef } from "react";
import axios from "axios";

function App() {

  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);

  };

  const handleUpload = async () => {

    if (!file) return alert("Please select a file");
    const formData = new FormData();
    formData.append("media", file);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData
      );

      setTranscript(response.data.transcript);

    } catch (error) {

      console.log(error);
      alert("Upload failed");

    } finally {
      setLoading(false);

    }
  };

  const startRecording = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/wav",
      });

      const audioFile = new File(
        [audioBlob],
        "recording.wav",
        {
          type: "audio/wav",
        }
      );

      const formData = new FormData();
      formData.append("media", audioFile);

      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:5000/api/upload",
          formData
        );
        setTranscript(response.data.transcript);
      } catch (error) {
        console.log(error);
        alert("Recording upload failed");
      } finally {
        setLoading(false);
      }
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex flex-col items-center justify-center px-4">

      <div className="absolute left-[-200px] top-[30%] w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-3xl" />
      <div className="absolute right-[-200px] top-[30%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center w-full">

        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-cyan-300 to-purple-400 bg-clip-text text-transparent">
          Speech To Text App
        </h1>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-5 w-full max-w-xl">

          <div className="border border-white/10 rounded-2xl p-5 bg-black/30 mb-6">
            <input type="file" accept="audio/*,video/*" onChange={handleFileChange} className="w-full text-zinc-300"/>
          </div>

          <button onClick={handleUpload} className="w-full py-3 rounded-2xl text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-[1.02] transition-all duration-300 shadow-lg mb-6">
            Upload File
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-zinc-500">OR</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          {

            !recording ? (
              <button onClick={startRecording} className="w-full py-3 rounded-2xl text-base font-semibold bg-green-500 hover:bg-green-600 hover:scale-[1.02] transition-all duration-300 shadow-lg">
                Start Recording
              </button>
            ) : (
              <button onClick={stopRecording} className="w-full py-3 rounded-2xl text-base font-semibold bg-red-500 hover:bg-red-600 hover:scale-[1.02] transition-all duration-300 shadow-lg">
                Stop Recording
              </button>
            )
          }
        </div>

        {

          loading && (
            <div className="mt-8 text-cyan-300 animate-pulse text-lg">
              Processing transcription...
            </div>
          )
        }

        {

          transcript && (
            <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-5 w-full max-w-xl">
              <h2 className="text-2xl font-bold mb-4">
                Transcript
              </h2>

              <p className="text-zinc-300 leading-relaxed">
                {transcript}
              </p>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default App;
