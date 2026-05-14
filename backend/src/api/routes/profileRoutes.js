// backend/src/api/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../../middlewares/authMiddleware');
const avatarUploadMiddleware = require('../../middlewares/uploadMiddleware');

router.use(authMiddleware);

// --- GET Routes ---
router.get('/', profileController.getUserProfile); //
router.get('/stats', profileController.getUserStats); //

// --- SINGLE Route for Updating Profile (Text and/or Avatar) ---
// The middleware processes the file first, then the controller receives both req.body and req.file.
router.patch(
    '/',
    avatarUploadMiddleware, // 1. Process the file and text fields.
    profileController.updateUserProfile // 2. The controller updates the database.
);

module.exports = router;