// backend/src/api/routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.param('id', (req, res, next, id) => {
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ status: 'fail', message: 'El ID de la etiqueta debe ser un número válido.' });
    }
    next();
});

router.use(authMiddleware);
router.get('/', tagController.getTags);
router.post('/', tagController.createTag);
router.get('/:id', tagController.getTagById);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;
