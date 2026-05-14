// backend/src/api/controllers/dashboardController.js
const dashboardService = require('../services/dashboardService');
const { createController } = require('../../utils/controllerFactory');

/**
 * Fetches summary statistics for the dashboard.
 */
exports.getDashboardSummary = createController(
    dashboardService.calculateSummaryStats.bind(dashboardService),
    ['userId']
);

/**
 * Fetches recently modified objectives for the dashboard preview.
 */
exports.getRecentObjectives = createController(
    (userId, query) => dashboardService.fetchRecentObjectives(userId, query.limit),
    ['userId', 'query']
);

/**
 * Fetches the user's recent activities.
 */
exports.getRecentActivities = createController(
    (userId, query) => dashboardService.fetchRecentActivities(userId, query.limit),
    ['userId', 'query']
);