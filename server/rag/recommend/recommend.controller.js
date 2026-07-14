const recommendService = require('./recommend.service');

/**
 * Controller to handle recommendation requests.
 * Endpoint: POST /recommend
 * 
 * Request:
 * {
 *   "userId": "...",
 *   "orderedFoodIds": ["..."]
 * }
 */
async function getRecommendations(req, res) {
  try {
    const { userId, orderedFoodIds } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    
    if (!orderedFoodIds || !Array.isArray(orderedFoodIds)) {
      return res.status(400).json({ success: false, message: 'orderedFoodIds must be an array' });
    }

    const recommendations = await recommendService.getRecommendations(userId, orderedFoodIds);

    return res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Recommendation Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while generating recommendations'
    });
  }
}

module.exports = {
  getRecommendations
};
