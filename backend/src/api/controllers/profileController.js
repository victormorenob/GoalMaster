const profileService = require('../services/profileService');
const { createController } = require('../../utils/controllerFactory');
const getAuthUserId = require('../../utils/getAuthUserId');

exports.getUserProfile = createController(
    (userId) => profileService.fetchUserProfile(userId).then(profile => ({ profile })),
    ['userId']
);

exports.getUserStats = createController(
    (userId) => profileService.fetchUserStats(userId).then(stats => ({ stats })),
    ['userId']
);

exports.updateUserProfile = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req);
        const updatedProfile = await profileService.updateUserProfile(userId, req.body, req.file);
        res.status(200).json({ status: 'success', data: updatedProfile });
    } catch (error) {
        next(error);
    }
};

exports.getAvatar = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req);
        await profileService.streamAvatar(userId, req.params.filename, res);
    } catch (error) {
        next(error);
    }
};
