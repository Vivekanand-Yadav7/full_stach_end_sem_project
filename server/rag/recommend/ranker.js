/**
 * Ranks and merges recommendations from different strategies.
 * @param {Object} params
 * @param {Array} params.similarFoods
 * @param {Array} params.frequentlyBoughtTogether
 * @param {Array} params.personalizedFoods
 * @returns {Array} Sorted array of recommendations
 */
function rankRecommendations({
  similarFoods = [],
  frequentlyBoughtTogether = [],
  personalizedFoods = []
}) {
  const scores = {};
  const items = {};

  // Configurable weights
  const WEIGHTS = {
    similar: 0.5,
    frequentlyBoughtTogether: 0.3,
    personalized: 0.2
  };

  // Helper to process a list of items
  const processList = (list, weight) => {
    // Normalize scores inside the list to max 1.0 (assuming items are already sorted by their own metrics)
    const maxScore = list.length > 0 ? (list[0].score || list[0].count || 1) : 1;
    list.forEach((item, index) => {
      const id = item.id;
      if (!items[id]) {
        items[id] = item;
        scores[id] = 0;
      }
      
      // Calculate a normalized score for the item
      let itemScore = 0;
      if (item.score !== undefined) {
        // usually vector similarity is between -1 and 1 or 0 and 1
        itemScore = Math.max(0, item.score);
      } else if (item.count !== undefined) {
        itemScore = item.count / maxScore;
      } else {
        // rank-based fallback
        itemScore = (list.length - index) / list.length;
      }

      scores[id] += itemScore * weight;
    });
  };

  processList(similarFoods, WEIGHTS.similar);
  processList(frequentlyBoughtTogether, WEIGHTS.frequentlyBoughtTogether);
  processList(personalizedFoods, WEIGHTS.personalized);

  // Convert to array and sort descending
  const rankedResults = Object.keys(scores).map(id => {
    return {
      ...items[id],
      finalScore: scores[id]
    };
  });

  rankedResults.sort((a, b) => b.finalScore - a.finalScore);

  return rankedResults;
}

module.exports = {
  rankRecommendations
};
