const { generateEmbedding } = require("../ingest/embeddings.js");
const { searchProducts } = require("../ingest/vectorStore.js");
const { llm } = require("../config/ollama.js");
const { buildPrompt } = require("./prompt.js");

async function retrieveProducts(query, limit = 10) {

    const queryEmbedding = await generateEmbedding(query);

    const results = await searchProducts(queryEmbedding, limit);

    const prompt = buildPrompt(query, results);

    const response = await llm.invoke(prompt);

    return response;
}

module.exports = { retrieveProducts };

