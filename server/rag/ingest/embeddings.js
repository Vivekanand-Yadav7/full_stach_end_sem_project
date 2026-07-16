const { embeddings } = require("../config/gemini.js");

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
