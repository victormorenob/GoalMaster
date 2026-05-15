// backend/src/api/routes/objectivesRoutes.js
const express = require('express');
const router = express.Router();
const objectivesController = require('../controllers/objectivesController');
const { validateCreateObjective, validateUpdateObjective } = require('../../middlewares/objectivesValidation');
const authMiddleware = require('../../middlewares/authMiddleware');

router.param('id', (req, res, next, id) => {
    // If the provided ID is NOT a sequence of one or more digits...
    if (!/^\d+$/.test(id)) {
        // ...respond immediately with an error and stop execution.
        return res.status(400).json({ status: 'fail', message: 'El ID del objetivo debe ser un número válido.' });
    }
    // If it is a valid number, continue to the next function (the controller).
    next();
});

router.use(authMiddleware);

router.get('/', objectivesController.getObjectives);
router.post('/', validateCreateObjective, objectivesController.createObjective);
router.get('/:id', objectivesController.getObjectiveById);
router.put('/:id', validateUpdateObjective, objectivesController.updateObjective);
router.delete('/:id', objectivesController.deleteObjective);
router.patch('/:id/unarchive', objectivesController.unarchiveObjective);
module.exports = router;