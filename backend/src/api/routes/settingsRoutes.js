const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../../middlewares/authMiddleware');

// All settings routes require authentication
router.use(authMiddleware);

// General settings routes
router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

// Change password route
router.put('/change-password', settingsController.changePassword);

// Export data route
router.get('/export-data', settingsController.exportUserData);

// Delete account route
router.delete('/account', settingsController.deleteAccount);

module.exports = router;