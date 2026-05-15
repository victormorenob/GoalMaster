// backend/src/api/controllers/objectivesController.js
const objectivesService = require('../services/objectivesService');
const { createController } = require('../../utils/controllerFactory');

exports.getObjectives = createController(
    (userId, query) => objectivesService.getAllObjectives(userId, query).then(objs => ({ objectives: objs })),
    ['userId', 'query']
);

exports.getObjectiveById = createController(
    (userId, params) => objectivesService.getObjectiveById(params.id, userId).then(obj => ({ objective: obj })),
    ['userId', 'params']
);

exports.createObjective = createController(
    (userId, body) => objectivesService.createObjective(body, userId).then(obj => ({ objective: obj })),
    ['userId', 'body'],
    { statusCode: 201 }
);

exports.updateObjective = createController(
    (userId, params, body) => objectivesService.updateObjective(params.id, userId, body).then(obj => ({ objective: obj })),
    ['userId', 'params', 'body']
);

exports.deleteObjective = createController(
    (userId, params) => objectivesService.deleteObjective(params.id, userId),
    ['userId', 'params'],
    { statusCode: 204 }
);

exports.unarchiveObjective = createController(
    (userId, params) => objectivesService.unarchiveObjective(params.id, userId).then(obj => ({ objective: obj })),
    ['userId', 'params']
);
