// backend/src/api/controllers/tagController.js
const tagService = require('../services/tagService');
const { createController } = require('../../utils/controllerFactory');

exports.getTags = createController(
    (userId) => tagService.getAllTags(userId).then(tags => ({ tags })),
    ['userId']
);

exports.getTagById = createController(
    (userId, params) => tagService.getTagById(params.id, userId).then(tag => ({ tag })),
    ['userId', 'params']
);

exports.createTag = createController(
    (userId, body) => tagService.createTag(body, userId).then(tag => ({ tag })),
    ['userId', 'body'],
    { statusCode: 201 }
);

exports.updateTag = createController(
    (userId, params, body) => tagService.updateTag(params.id, userId, body).then(tag => ({ tag })),
    ['userId', 'params', 'body']
);

exports.deleteTag = createController(
    (userId, params) => tagService.deleteTag(params.id, userId),
    ['userId', 'params'],
    { statusCode: 204 }
);
