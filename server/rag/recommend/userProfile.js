const prisma = require('../../config/prisma');
const client = require('../config/qdrant');

const COLLECTION = 'products';

/**
 * Averages an array of vectors.
 * @param {Array<Array<number>>} vectors 
 * @returns {Array<number>}
 */
function averageVectors(vectors) {
  if (!vectors || vectors.length === 0) return [];
  const dim = vectors[0].length;
  const sum = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) {
      sum[i] += v[i];
    }
  }
  return sum.map(val => val / vectors.length);
}

/**
 * Calculates and updates user's preference embedding.
 * @param {string} userId 
 */
async function updateUserProfile(userId) {
  // Get all foods previously ordered by the user
  const orders = await prisma.order.findMany({
    where: { placedById: userId },
    include: { products: true }
  });

  const orderedFoodIds = [];
  for (const order of orders) {
    for (const item of order.products) {
      if (item.productId) orderedFoodIds.push(item.productId);
    }
  }

  if (orderedFoodIds.length === 0) return;

  // Retrieve embeddings for these foods (not searching, just retrieving)
  const uniqueFoodIds = [...new Set(orderedFoodIds)];
  const points = await client.retrieve(COLLECTION, {
    ids: uniqueFoodIds,
    with_vector: true
  });

  const vectors = points.map(p => p.vector).filter(v => v);
  if (vectors.length === 0) return;

  const userEmbedding = averageVectors(vectors);

  // Store user embedding in PostgreSQL
  await prisma.userEmbedding.upsert({
    where: { userId },
    update: { embedding: userEmbedding },
    create: { userId, embedding: userEmbedding }
  });
}

/**
 * Returns the stored user embedding.
 * @param {string} userId 
 * @returns {Promise<Array<number>|null>}
 */
async function getUserEmbedding(userId) {
  const userProfile = await prisma.userEmbedding.findUnique({
    where: { userId }
  });

  if (!userProfile) return null;
  return userProfile.embedding;
}

module.exports = {
  updateUserProfile,
  getUserEmbedding
};
