// backend/src/api/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../../middlewares/authMiddleware');

// All AI routes require authentication
router.use(authMiddleware);

// POST /api/ai/chat — Send a message to the AI assistant
router.post('/chat', aiController.chat);

// POST /api/ai/suggest — Get AI-powered suggestions for objectives
router.post('/suggest', aiController.suggest);

module.exports = router;
