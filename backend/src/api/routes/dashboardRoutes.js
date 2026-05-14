// backend/src/api/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.use(authMiddleware);

// Routes without the /dashboard/ prefix
router.get('/summary-stats', dashboardController.getDashboardSummary);
router.get('/recent-objectives', dashboardController.getRecentObjectives);
router.get('/recent-activities', dashboardController.getRecentActivities);

module.exports = router;