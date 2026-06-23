// backend/src/api/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const aiController = require('../controllers/aiController');

router.use(authMiddleware);
router.post('/chat', aiController.chat);
router.post('/suggest', aiController.suggest);

module.exports = router;
