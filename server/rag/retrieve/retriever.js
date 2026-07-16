const { generateEmbedding } = require("../ingest/embeddings.js");
const { searchProducts } = require("../ingest/vectorStore.js");
const { llm } = require("../config/gemini.js");
const { buildPrompt } = require("./prompt.js");

async function retrieveProducts(query, limit = 10) {

    const queryEmbedding = await generateEmbedding(query);

    const results = await searchProducts(queryEmbedding, limit);

    // Extract product IDs from Qdrant results
    const productIds = results
        .map((r) => r.payload?.productId)
        .filter(Boolean);

    const prompt = buildPrompt(query, results);

    const response = await llm.invoke(prompt);

    return {
        recommendation: response.content ?? response,
        productIds,
    };
}

module.exports = { retrieveProducts };
