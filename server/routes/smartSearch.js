const express = require('express');
const { auth } = require('../middleware/auth');
const { retrieveProducts } = require('../rag/retrieve/retriever');

const router = express.Router();

/**
 * POST /api/smart-search
 * Body: { query: string, limit?: number }
 *
 * Performs semantic search + LLM recommendation via RAG pipeline.
 */
router.post('/', auth, async (req, res) => {
    const { query, limit = 5 } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ message: 'Query is required.' });
    }

    try {
        const response = await retrieveProducts(query.trim(), limit);
        res.json({
            query,
            recommendation: response.content ?? response,
        });
    } catch (error) {
        console.error('Smart search error:', error);
        res.status(500).json({ message: 'Smart search failed.', error: error.message });
    }
});

module.exports = router;
