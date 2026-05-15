// backend/src/api/routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.param('id', (req, res, next, id) => {
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ status: 'fail', message: 'El ID de la plantilla debe ser un número válido.' });
    }
    next();
});

// Templates are public or semi-public — but we keep auth for consistency
router.use(authMiddleware);

router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);

module.exports = router;
