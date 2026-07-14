const vectorRecommend = require('./vectorRecommend');
const frequentlyBoughtTogether = require('./frequentlyBoughtTogether');
const userProfile = require('./userProfile');
const ranker = require('./ranker');
const recommendService = require('./recommend.service');
const recommendController = require('./recommend.controller');
const utils = require('./utils');

module.exports = {
  ...vectorRecommend,
  ...frequentlyBoughtTogether,
  ...userProfile,
  ...ranker,
  ...recommendService,
  ...recommendController,
  ...utils
};
