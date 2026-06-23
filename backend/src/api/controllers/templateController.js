// backend/src/api/controllers/templateController.js
const templateService = require('../services/templateService');
const { createController } = require('../../utils/controllerFactory');

exports.getTemplates = createController(
    (userId, query) => templateService.getTemplates(userId, query.category).then(templates => ({ templates })),
    ['userId', 'query']
);

exports.getTemplateById = createController(
    (params) => templateService.getTemplateById(params.id).then(template => ({ template })),
    ['params']
);
