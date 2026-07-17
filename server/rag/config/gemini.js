const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",  // 768d — compatible with existing Qdrant collection
});

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",   // gemini-2.5-flash not available for new API keys
    temperature: 0,
});

module.exports = { embeddings, llm };