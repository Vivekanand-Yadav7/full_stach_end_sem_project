const { generateEmbedding } = require("../ingest/embeddings.js");
const { searchProducts } = require("../ingest/vectorStore.js");
const { generateShoppingRecommendation } = require("../config/qwen.js");
const { buildChatMessages, buildPrompt } = require("./prompt.js");

async function retrieveProducts(query, limit = 10) {
    const queryEmbedding = await generateEmbedding(query);

    const results = await searchProducts(queryEmbedding, limit);

    // Extract product IDs from Qdrant results
    const productIds = results
        .map((r) => r.payload?.productId)
        .filter(Boolean);

    const messages = buildChatMessages(query, results);
    const rawPrompt = buildPrompt(query, results);

    // Generates using fine-tuned Qwen 2B model, with automatic Gemini fallback
    const { text, source } = await generateShoppingRecommendation(messages, rawPrompt);

    return {
        recommendation: text,
        productIds,
        modelSource: source,
    };
}

module.exports = { retrieveProducts };
