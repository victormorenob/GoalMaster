// backend/src/api/routes/analysisRoutes.js
const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/summary', analysisController.getSummary);
router.get('/category-distribution', analysisController.getCategoryDistribution);
router.get('/status-distribution', analysisController.getObjectiveStatusDistribution);
router.get('/monthly-progress', analysisController.getMonthlyProgress);
router.get('/ranked-objectives', analysisController.getRankedObjectives);
router.get('/category-average-progress', analysisController.getCategoryAverageProgress);
router.get('/detailed-by-category', analysisController.getDetailedObjectivesByCategory);

// Route added for the per-objective progress chart.
// This route must match the one called by 'apiService.js' in the frontend.
router.get('/objective-progress-chart-data', analysisController.getObjectivesProgressChartData);

module.exports = router;