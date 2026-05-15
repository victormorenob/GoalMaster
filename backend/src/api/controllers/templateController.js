// backend/src/api/controllers/templateController.js
const templateService = require('../services/templateService');
const { createController } = require('../../utils/controllerFactory');

exports.getTemplates = createController(
    (query) => templateService.getAllTemplates(query.category).then(templates => ({ templates })),
    ['query']
);

exports.getTemplateById = createController(
    (params) => templateService.getTemplateById(params.id).then(template => ({ template })),
    ['params']
);
