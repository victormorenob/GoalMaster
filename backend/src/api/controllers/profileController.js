// backend/src/api/controllers/profileController.js
const profileService = require('../services/profileService');
const AppError = require('../../utils/AppError');
const getAuthUserId = require('../../utils/getAuthUserId');

class ProfileController {
    async getUserProfile(req, res, next) {
        try {
            const userId = getAuthUserId(req);
            const profile = await profileService.fetchUserProfile(userId); //
            res.status(200).json({ status: 'success', data: profile });
        } catch (error) {
            next(error);
        }
    }

    async getUserStats(req, res, next) {
        try {
            const userId = getAuthUserId(req);
            const stats = await profileService.fetchUserStats(userId); //
            res.status(200).json({ status: 'success', data: stats });
        } catch (error) {
            next(error);
        }
    }

    async updateUserProfile(req, res, next) {
        try {
            const userId = getAuthUserId(req);
            // Pass the request body (text) and file (image) to the service.
            const updatedProfile = await profileService.updateUserProfile(userId, req.body, req.file); //
            res.status(200).json({ status: 'success', data: updatedProfile });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProfileController();