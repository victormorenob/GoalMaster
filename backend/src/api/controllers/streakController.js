// backend/src/api/controllers/streakController.js
const streakService = require('../services/streakService');
const { createController } = require('../../utils/controllerFactory');

exports.getStreak = createController(
    (userId) => streakService.getStreak(userId).then(streak => ({ streak })),
    ['userId']
);

exports.updateStreak = createController(
    (userId) => streakService.updateStreak(userId).then(result => ({ streak: result })),
    ['userId']
);
