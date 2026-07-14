const client = require('../config/qdrant.js');
const prisma = require('../../config/prisma');

const COLLECTION = 'products';

/**
 * Recommends similar foods based on vector embeddings in Qdrant.
 * @param {string} foodId 
 * @param {number} limit 
 * @returns {Promise<Array>} Array of similar foods
 */
async function recommendSimilarFoods(foodId, limit = 5) {
  // 1. Fetch the food from PostgreSQL
  const food = await prisma.product.findUnique({
    where: { id: foodId }
  });

  if (!food) {
    throw new Error(`Food with id ${foodId} not found in PostgreSQL.`);
  }

  // 2. Read its embedding from Qdrant
  const points = await client.retrieve(COLLECTION, {
    ids: [foodId],
    with_vector: true
  });

  if (!points || points.length === 0 || !points[0].vector) {
    // No embedding found
    return [];
  }

  const embedding = points[0].vector;

  // 3. Search Qdrant using that embedding
  // 4. Exclude the queried food itself
  const searchResults = await client.search(COLLECTION, {
    vector: embedding,
    limit: limit,
    filter: {
      must_not: [
        {
          has_id: [foodId]
        }
      ]
    }
  });

  // 5. Return the Top N similar foods
  return searchResults.map(res => ({
    id: res.id,
    score: res.score,
    ...res.payload
  }));
}

module.exports = {
  recommendSimilarFoods
};
