const client = require("../config/qdrant.js");

const COLLECTION = "products";

/**
 * Creates the collection if it doesn't already exist.
 */
async function ensureCollection(size) {
    const collections = await client.getCollections();

    const exists = collections.collections.some(
        (c) => c.name === COLLECTION
    );

    if (exists) return;

    await client.createCollection(COLLECTION, {
        vectors: {
            size,
            distance: "Cosine",
        },
    });

    console.log(`✅ Collection '${COLLECTION}' created.`);
}

/**
 * Stores (or updates) a product vector.
 * Uses productId as the Qdrant point id.
 */
async function saveProductVector(
    productId,
    embedding,
    metadata
) {
    try {
        await ensureCollection(embedding.length);

        await client.upsert(COLLECTION, {
            wait: true,
            points: [
                {
                    id: productId,
                    vector: embedding,
                    payload: metadata,
                },
            ],
        });

        console.log(`✅ Indexed product ${productId}`);
    } catch (error) {
        console.error("Error saving vector:", error);
        throw error;
    }
}

/**
 * Deletes a product vector.
 */
async function deleteProductVector(productId) {
    try {
        await client.delete(COLLECTION, {
            wait: true,
            points: [productId],
        });

        console.log(`🗑 Deleted vector for product ${productId}`);
    } catch (error) {
        console.error("Error deleting vector:", error);
        throw error;
    }
}

/**
 * Performs semantic search.
 *
 * Returns the top matching products.
 */
async function searchProducts(
    queryEmbedding,
    limit = 10,
    filters = null
) {
    try {
        const options = {
            vector: queryEmbedding,
            limit,
        };

        if (filters) {
            options.filter = filters;
        }

        const results = await client.search(COLLECTION, options);

        return results;
    } catch (error) {
        console.error("Error searching products:", error);
        throw error;
    }
}

module.exports = {
    ensureCollection,
    saveProductVector,
    deleteProductVector,
    searchProducts
};