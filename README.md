Speechify AI

A Full-Stack Speech-to-Text Web Application built using React, Express.js, MongoDB, Socket.IO, and Deepgram.

Features:-
1. Audio file upload and transcription
2. Real-time speech-to-text transcription
3. User authentication with JWT
4. User-specific transcription history
5. MongoDB database integration
6. Deepgram Speech-to-Text API integration
7. Responsive modern UI built with React and Tailwind CSS
8. Backend deployed on Render
9. Frontend deployed on Vercel

Tech Stack:-

Frontend:
1. React
2. Vite
3. Tailwind CSS
4. Axios
5. Socket.IO Client

Backend:
1. Node.js
2. Express.js
3. Socket.IO
4. MongoDB Atlas
5. Mongoose
6. JWT Authentication
7. Multer

Speech Recognition:-
Deepgram API

Installation:-
Clone Repository:
git clone <repository-url>
cd SpeechtoTextAPI

Backend Setup:
cd server
npm install

Create a .env file:-

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
DEEPGRAM_API_KEY=your_deepgram_api_key

Start backend:-
npm start

Frontend Setup:-
cd client
npm install
npm run dev

API Endpoints:-
Authentication:

POST /api/auth/register
Register a new user.

POST /api/auth/login
Login and receive JWT token.

Upload:
POST /api/upload
Upload an audio file and receive transcription.

History:
GET /api/upload/transcriptions
Retrieve user transcription history.

Deployment:-
Backend:
Deployed on Render.

Frontend:
Deployed on Vercel.

Future Improvements:-
1. Cloud storage for audio files
2. Export transcriptions
3. Multiple language support
4. User profile management
5. Speech summarization using AI