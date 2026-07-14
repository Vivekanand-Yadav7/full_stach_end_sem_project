const prisma = require('../../config/prisma');

/**
 * Updates co-occurrence counts for foods bought together in an order.
 * @param {Object} order - Order object containing products array
 */
async function updateCoOccurrence(order) {
  if (!order || !order.products || order.products.length < 2) {
    return; // Nothing to pair
  }

  const foodIds = order.products.map(p => p.productId || p.product);
  
  // Create unique pairs
  const pairs = [];
  for (let i = 0; i < foodIds.length; i++) {
    for (let j = 0; j < foodIds.length; j++) {
      if (i !== j) {
        pairs.push({
          foodA: foodIds[i],
          foodB: foodIds[j]
        });
      }
    }
  }

  // Upsert pairs into PostgreSQL
  for (const pair of pairs) {
    const existing = await prisma.foodCoOccurrence.findUnique({
      where: {
        foodA_foodB: {
          foodA: pair.foodA,
          foodB: pair.foodB
        }
      }
    });

    if (existing) {
      await prisma.foodCoOccurrence.update({
        where: { id: existing.id },
        data: { count: existing.count + 1 }
      });
    } else {
      await prisma.foodCoOccurrence.create({
        data: {
          foodA: pair.foodA,
          foodB: pair.foodB,
          count: 1
        }
      });
    }
  }
}

/**
 * Returns most frequently bought together foods for a given foodId.
 * @param {string} foodId 
 * @param {number} limit 
 * @returns {Promise<Array>} Array of frequently paired foods
 */
async function getFrequentlyBoughtTogether(foodId, limit = 5) {
  const pairs = await prisma.foodCoOccurrence.findMany({
    where: { foodA: foodId },
    orderBy: { count: 'desc' },
    take: limit
  });

  if (!pairs || pairs.length === 0) return [];

  const foodBIds = pairs.map(p => p.foodB);
  const pairedFoods = await prisma.product.findMany({
    where: { id: { in: foodBIds } }
  });

  return pairs.map(p => {
    const food = pairedFoods.find(f => f.id === p.foodB);
    return {
      id: p.foodB,
      count: p.count,
      ...food
    };
  }).filter(f => f.name);
}

module.exports = {
  updateCoOccurrence,
  getFrequentlyBoughtTogether
};
