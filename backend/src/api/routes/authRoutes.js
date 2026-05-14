// backend/src/api/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../../middlewares/userValidation');
const authMiddleware = require('../../middlewares/authMiddleware');

// Public authentication routes (no global authMiddleware)
router.post('/register', validateRegistration, userController.register);
router.post('/login', validateLogin, userController.login);

// Protected route
router.delete('/logout', authMiddleware, userController.logout);

module.exports = router;