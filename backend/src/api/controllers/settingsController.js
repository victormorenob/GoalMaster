// backend/src/api/controllers/settingsController.js
const settingsService = require('../services/settingsService');
const { createController } = require('../../utils/controllerFactory');
const getAuthUserId = require('../../utils/getAuthUserId'); // Import the utility

exports.getSettings = createController(
    settingsService.fetchUserSettings.bind(settingsService),
    ['userId']
);

exports.updateSettings = createController(
    (userId, body) => settingsService.updateUserSettings(userId, body),
    ['userId', 'body']
);

exports.changePassword = createController(
    (userId, body) => settingsService.changeUserPassword(userId, body.currentPassword, body.newPassword),
    ['userId', 'body']
);

// Special cases with custom responses
exports.exportUserData = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req);
        const userData = await settingsService.exportAllUserData(userId);
        
        res.setHeader('Content-Disposition', `attachment; filename="user_data_${userId}.json"`);
        res.status(200).json(userData);
    } catch (error) {
        next(error);
    }
};

exports.deleteAccount = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req);
        const result = await settingsService.deleteUserAccount(userId, req.body.password);
        res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
        next(error);
    }
};