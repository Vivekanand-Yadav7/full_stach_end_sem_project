const express = require('express');
const { auth } = require('../middleware/auth');
const { getRecommendations } = require('../rag/recommend/recommend.controller');

const router = express.Router();

// POST /api/recommend
router.post('/', auth, getRecommendations);

module.exports = router;
