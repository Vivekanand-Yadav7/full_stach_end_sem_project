const { recommendSimilarFoods } = require('./vectorRecommend');
const { getFrequentlyBoughtTogether } = require('./frequentlyBoughtTogether');
const { getUserEmbedding } = require('./userProfile');
const { rankRecommendations } = require('./ranker');
const client = require('../config/qdrant');

const COLLECTION = 'products';

/**
 * Orchestrates different recommendation modules to generate a final ranked list.
 * @param {string} userId 
 * @param {Array<string>} orderedFoodIds 
 * @returns {Promise<Array>} Top 10 ranked recommendations
 */
async function getRecommendations(userId, orderedFoodIds = []) {
  let allSimilarFoods = [];
  let allFrequentlyBought = [];

  // For every ordered food, get vector recommendations & frequently bought together
  for (const foodId of orderedFoodIds) {
    try {
      const similar = await recommendSimilarFoods(foodId, 5);
      allSimilarFoods = allSimilarFoods.concat(similar);
      
      const freqBought = await getFrequentlyBoughtTogether(foodId, 5);
      allFrequentlyBought = allFrequentlyBought.concat(freqBought);
    } catch (err) {
      console.warn(`Could not get item-based recommendations for food ${foodId}:`, err.message);
    }
  }

  // Get personalized recommendations using the user embedding
  let personalizedFoods = [];
  if (userId) {
    try {
      const userEmbedding = await getUserEmbedding(userId);
      if (userEmbedding && userEmbedding.length > 0) {
        // Search Qdrant using the user embedding
        const searchResults = await client.search(COLLECTION, {
          vector: userEmbedding,
          limit: 10
        });
        
        personalizedFoods = searchResults.map(res => ({
          id: res.id,
          score: res.score,
          ...res.payload
        }));
      }
    } catch (err) {
      console.warn(`Could not get personalized recommendations for user ${userId}:`, err.message);
    }
  }

  // Merge everything & rank results
  const rankedResults = rankRecommendations({
    similarFoods: allSimilarFoods,
    frequentlyBoughtTogether: allFrequentlyBought,
    personalizedFoods: personalizedFoods
  });

  // Filter out the items the user just ordered from the final results
  const finalRecommendations = rankedResults.filter(
    item => !orderedFoodIds.includes(item.id)
  );

  // Return Top 10 recommendations
  return finalRecommendations.slice(0, 10);
}

module.exports = {
  getRecommendations
};
