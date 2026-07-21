const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const gKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").replace(/^"|"$/g, '').trim();

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",  // 768d — compatible with existing Qdrant collection
    apiKey: gKey,
});

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",   // gemini-2.5-flash not available for new API keys
    temperature: 0,
    apiKey: gKey,
});

module.exports = { embeddings, llm };