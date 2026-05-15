// backend/src/api/services/templateService.js
const db = require('../../config/database');
const AppError = require('../../utils/AppError');

const { GoalTemplate } = db;

class TemplateService {

    async getAllTemplates(category = null) {
        const whereClause = {};
        if (category && category !== 'all') {
            whereClause.category = category;
        }
        const templates = await GoalTemplate.findAll({
            where: whereClause,
            order: [['category', 'ASC'], ['name', 'ASC']]
        });
        return templates;
    }

    async getTemplateById(templateId) {
        const template = await GoalTemplate.findByPk(templateId);
        if (!template) {
            throw new AppError('Plantilla no encontrada.', 404);
        }
        return template;
    }
}

const templateServiceInstance = new TemplateService();
module.exports = templateServiceInstance;
