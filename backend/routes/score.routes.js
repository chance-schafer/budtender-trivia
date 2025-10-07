// backend/routes/score.routes.js
const controller = require('../controllers/score.controller');
const { authJwt } = require('../middleware');

module.exports = function registerScoreRoutes(app) {
  const router = require('express').Router();

  router.post('/', [authJwt.verifyToken], controller.submitScore);
  router.get('/my-history', [authJwt.verifyToken], controller.getUserScoreHistory);
  router.get('/cultivated', controller.getCultivated);

  app.use('/api/scores', router);
};
