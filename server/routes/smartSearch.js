const express = require('express');
const prisma = require('../config/prisma');
const { auth } = require('../middleware/auth');
const { retrieveProducts } = require('../rag/retrieve/retriever');

const router = express.Router();

/**
 * POST /api/smart-search
 * Body: { query: string, limit?: number }
 *
 * Performs semantic search + LLM recommendation via RAG pipeline.
 * Returns the AI recommendation AND the actual product records from the DB.
 */
router.post('/', auth, async (req, res) => {
    const { query, limit = 5 } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ message: 'Query is required.' });
    }

    try {
        const { recommendation, productIds } = await retrieveProducts(query.trim(), limit);

        // Fetch full product records from Postgres using the IDs returned by Qdrant
        let products = [];
        if (productIds.length > 0) {
            products = await prisma.product.findMany({
                where: { id: { in: productIds } },
                orderBy: { createdAt: 'desc' },
            });

            // Preserve the relevance order from Qdrant
            const idOrder = new Map(productIds.map((id, idx) => [id, idx]));
            products.sort((a, b) => (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999));
        }

        res.json({
            query,
            recommendation,
            products,      // full product objects, same shape as GET /products
        });
    } catch (error) {
        console.error('Smart search error:', error);
        res.status(500).json({ message: 'Smart search failed.', error: error.message });
    }
});

module.exports = router;
