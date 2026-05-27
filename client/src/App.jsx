import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

function App() {

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const socketRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);

  };

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
    auth: {
        token: localStorage.getItem("token"),
    },
    });
    socketRef.current.on("connect", () => {
      console.log("Socket Connected");
    });
    socketRef.current.off("transcript");
    socketRef.current.on("transcript", (data) => {
      setLiveTranscript(data);
    });
    socketRef.current.on("connect_error", () => {
      setError("Realtime connection failed");
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const handleUpload = async () => {
    setError("");
    if (!file) {
      setError("Please select an audio/video file");
      return;
    }
    const formData = new FormData();
    formData.append("media", file);

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:5000/api/upload",
          {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }, 
        formData);
      setTranscript(response.data.transcript);
      fetchTranscriptions();
    } catch (error) {

      console.log(error);
      setError(error.response?.data?.message || "Upload failed");

    } finally {
      setLoading(false);

    }
  };
  const handleAuth = async () => {
  try {
      if (isLogin) {
        const response = await axios.post("http://localhost:5000/api/auth/login",
          {
            email,
            password,
          }
        );
        localStorage.setItem(
          "token",
          response.data.token
        );
        setShowAuthModal(false);
        fetchTranscriptions();
      } else {
        await axios.post("http://localhost:5000/api/auth/register",
          {
            username,
            email,
            password,
          }
        );
        alert("Registration successful");
        setIsLogin(true);
      }
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message ||
        "Authentication failed"
      );
    }
  };

  const startRecording = async () => {

      try {
      setTranscript("");
      setLiveTranscript("");
      socketRef.current.emit("start-recording");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = async (event) => {
        console.log(event.data);
        if (event.data.size > 0) {
          socketRef.current.emit("audio-data", event.data);
        }
      };
      mediaRecorder.start(250);
      setRecording(true);
    } catch (error) {
      console.log(error);
      setError("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    socketRef.current.emit("stop-recording");
    setTranscript(liveTranscript);
    setRecording(false);
    setTimeout(() => {
    fetchTranscriptions();
    }, 1000);
  };

  const fetchTranscriptions = async () => {

  try {
      const response = await axios.get("http://localhost:5000/api/upload/transcriptions",
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
      );
      setHistory(response.data);
    } catch (error) {
      console.log(error);
    }

  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex flex-col items-center justify-center px-4">

      <div className="absolute left-[-200px] top-[30%] w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-3xl" />
      <div className="absolute right-[-200px] top-[30%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl" />

      <div className="relative z-10 flex gap-8 w-full max-w-7xl items-center justify-end">
      <div className="absolute top-6 left-6 z-20">
      <button onClick={() => setShowAuthModal(true)} className="bg-white/10 backdrop-blur-lg border border-white/20 px-5 py-2 rounded-2xl hover:bg-white/20 transition-all duration-300">
        Login
      </button>
      </div>
      <div className="flex-1 max-w-2xl">
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
        recording && (
          <div className="mt-8 bg-cyan-500/10 backdrop-blur-xl border border-cyan-400/20 rounded-3xl shadow-2xl p-6 w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">
              Live Transcript
            </h2>

            <p className="text-zinc-300 leading-relaxed">
              {liveTranscript || "Listening..."}
            </p>
          </div>
          )
        }

        {

          loading && (
            <div className="mt-8 text-cyan-300 animate-pulse text-lg">
              Processing transcription...
            </div>
          )
        }
        {

          error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl w-full max-w-xl">
              {error}
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
      <div className="w-[350px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-[700px] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-cyan-500">
        {
           localStorage.getItem("token") && history.length > 0 && (
            <div className="mt-8 w-full max-w-xl">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Previous Transcriptions
              </h2>

              <div className="space-y-4">
                {
                  history.map((item, index) => (

                    <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-2xl">

                      <p className="text-cyan-300 text-sm mb-2">
                        {item.filename}
                      </p>

                      <p className="text-zinc-300">
                        {item.transcription}
                      </p>
                    </div>
                  ))
                }
              </div>
            </div>
          )
        }
      </div>
      </div>
      {

      showAuthModal && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-6 text-center">
              {
                isLogin
                ? "Welcome Back"
                : "Create Account"
              }
            </h2>

            {
              !isLogin && (
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-black/30 border border-white/10 outline-none"/>
              )
            }

            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-black/30 border border-white/10 outline-none"/>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-6 p-3 rounded-xl bg-black/30 border border-white/10 outline-none"/>
            <button onClick={handleAuth} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-[1.02] transition-all duration-300">
              {
                isLogin
                ? "Login"
                : "Register"
              }
            </button>
            <p className="text-center text-zinc-400 mt-6">
              {
                isLogin
                ? "Don't have an account?"
                : "Already have an account?"
              }
              <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-cyan-400 hover:underline">
                {
                  isLogin
                  ? "Register"
                  : "Login"
                }
              </button>
            </p>
          </div>
        </div>
      )
    }
    </div>
  );
}

export default App;
