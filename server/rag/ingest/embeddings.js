const { OllamaEmbeddings } = require("@langchain/ollama");

const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434",
});

async function generateEmbedding(text) {
    try {
        const vector = await embeddings.embedQuery(text);
        return vector;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}

module.exports = { generateEmbedding };
