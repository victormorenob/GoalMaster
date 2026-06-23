// backend/src/api/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../../middlewares/userValidation');
const { authLimiter, apiLimiter } = require('../../middlewares/rateLimitMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');

// Public authentication routes (no global authMiddleware)
router.post('/register', authLimiter, validateRegistration, userController.register);
router.post('/login', authLimiter, validateLogin, userController.login);

// Protected route
router.post('/logout', authMiddleware, userController.logout);

module.exports = router;