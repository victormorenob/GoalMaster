// backend/src/api/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// This import now works correctly:
const { validateUserUpdate } = require('../../middlewares/userValidation');
const authMiddleware = require('../../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/:id', userController.getUserById);
router.put('/:id', validateUserUpdate, userController.updateUser); // This no longer throws an error
router.delete('/:id', userController.deleteUser);

module.exports = router;