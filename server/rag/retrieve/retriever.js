const { generateEmbedding } = require("../ingest/embeddings.js");
const { searchProducts } = require("../ingest/vectorStore.js");
const { generateShoppingRecommendation } = require("../config/qwen.js");
const { buildChatMessages, buildPrompt } = require("./prompt.js");
const prisma = require("../../config/prisma.js");

/**
 * Score a product's relevance to a query using keyword matching.
 * Weights: name (3x) > category (2x) > description (1x)
 */
function keywordRelevanceScore(product, queryTerms) {
    let score = 0;
    const name = (product.name || "").toLowerCase();
    const category = (product.category || "").toLowerCase();
    const description = (product.description || "").toLowerCase();

    for (const term of queryTerms) {
        if (name.includes(term)) score += 3;
        if (category.includes(term)) score += 2;
        if (description.includes(term)) score += 1;
    }
    return score;
}

async function retrieveProducts(query, limit = 10) {
    let results = [];
    let productIds = [];
    let usedFallback = false;

    // --- Step 1: Try Qdrant vector search ---
    try {
        const queryEmbedding = await generateEmbedding(query);
        results = await searchProducts(queryEmbedding, limit);
        productIds = results.map((r) => r.payload?.productId).filter(Boolean);
        console.log(`✅ Qdrant returned ${results.length} results`);
    } catch (err) {
        console.warn(`⚠️  Qdrant unavailable (${err.message}). Falling back to Postgres product fetch.`);
        usedFallback = true;
    }

    // --- Step 2: Postgres fallback with keyword relevance ranking ---
    if (usedFallback || results.length === 0) {
        try {
            // Fetch a larger pool so we can rank them, then trim to limit
            const dbProducts = await prisma.product.findMany({
                take: 50,
                orderBy: { createdAt: "desc" },
            });

            // Tokenise query into lowercase terms (filter short noise words)
            const queryTerms = query
                .toLowerCase()
                .split(/\s+/)
                .filter((t) => t.length > 2);

            // Score each product and sort by relevance desc
            const scored = dbProducts
                .map((p) => ({
                    product: p,
                    score: keywordRelevanceScore(p, queryTerms),
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            // Shape to match Qdrant result format
            results = scored.map(({ product: p, score }) => ({
                payload: {
                    productId: p.id,
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity,
                    category: p.category,
                    description: p.description,
                },
                score,
            }));

            productIds = results.map((r) => r.payload.productId);
            console.log(`✅ Postgres fallback: ranked ${dbProducts.length} products by keyword relevance, returning top ${results.length}`);
        } catch (dbErr) {
            console.error("❌ Postgres fallback also failed:", dbErr.message);
            // Return empty gracefully — LLM will still try with no context
        }
    }

    // --- Step 3: Build prompts & generate recommendation ---
    const messages = buildChatMessages(query, results);
    const rawPrompt = buildPrompt(query, results);

    const { text, source } = await generateShoppingRecommendation(messages, rawPrompt);

    return {
        recommendation: text,
        productIds,
        modelSource: source,
    };
}

module.exports = { retrieveProducts };
