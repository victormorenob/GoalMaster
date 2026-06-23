// backend/src/api/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../../middlewares/authMiddleware');
const avatarUploadMiddleware = require('../../middlewares/uploadMiddleware');
const { validateProfilePatch } = require('../../middlewares/userValidation');

router.use(authMiddleware);

// --- GET Routes ---
router.get('/', profileController.getUserProfile); //
router.get('/stats', profileController.getUserStats); //
router.get('/avatar/:filename', profileController.getAvatar);

// --- SINGLE Route for Updating Profile (Text and/or Avatar) ---
// The middleware processes the file first, then the controller receives both req.body and req.file.
router.patch(
    '/',
    avatarUploadMiddleware,
    validateProfilePatch,
    profileController.updateUserProfile
);

module.exports = router;