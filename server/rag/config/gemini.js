const { GoogleGenAIEmbeddings, ChatGoogleGenAI } = require("@langchain/google-genai");

const embeddings = new GoogleGenAIEmbeddings({
    model: "text-embedding-004",
});

const llm = new ChatGoogleGenAI({
    model: "gemini-2.5-flash",
    temperature: 0,
});

module.exports = { embeddings, llm };