const { DeepgramClient } = require("@deepgram/sdk");

const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });

module.exports = deepgram;