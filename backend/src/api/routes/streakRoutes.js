// backend/src/api/routes/streakRoutes.js
const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', streakController.getStreak);
router.post('/update', streakController.updateStreak);

module.exports = router;
