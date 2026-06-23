const db = require('../../config/database');
const AppError = require('../../utils/AppError');

const { GoalTemplate } = db;
const { Op } = db.Sequelize;

const SYSTEM_TEMPLATES = [
    {
        name: 'Ahorro mensual',
        description: 'Meta de ahorro con objetivo cuantitativo',
        category: 'FINANCE',
        isSystem: true,
        templateData: { name: 'Ahorrar €500', category: 'FINANCE', initialValue: 0, targetValue: 500, unit: '€', isLowerBetter: false },
    },
    {
        name: 'Ejercicio semanal',
        description: 'Rutina de ejercicio regular',
        category: 'HEALTH',
        isSystem: true,
        templateData: { name: 'Entrenar 3 veces por semana', category: 'HEALTH', initialValue: 0, targetValue: 12, unit: 'sesiones', isLowerBetter: false },
    },
    {
        name: 'Leer un libro',
        description: 'Objetivo de lectura personal',
        category: 'PERSONAL_DEV',
        isSystem: true,
        templateData: { name: 'Leer 1 libro al mes', category: 'PERSONAL_DEV', initialValue: 0, targetValue: 1, unit: 'libros', isLowerBetter: false },
    },
];

class TemplateService {
    async ensureSystemTemplates() {
        for (const tpl of SYSTEM_TEMPLATES) {
            const exists = await GoalTemplate.findOne({ where: { name: tpl.name, isSystem: true } });
            if (!exists) await GoalTemplate.create({ ...tpl, userId: null });
        }
    }

    async getAllTemplates(category = null) {
        await this.ensureSystemTemplates();
        const whereClause = category && category !== 'all' ? { category } : {};
        return GoalTemplate.findAll({
            where: {
                ...whereClause,
                [Op.or]: [{ isSystem: true }, { userId: { [Op.ne]: null } }],
            },
            order: [['isSystem', 'DESC'], ['name', 'ASC']],
        });
    }

    async getTemplates(userId, category = null) {
        await this.ensureSystemTemplates();
        const whereClause = category && category !== 'all' ? { category } : {};
        return GoalTemplate.findAll({
            where: {
                ...whereClause,
                [Op.or]: [{ isSystem: true }, { userId }],
            },
            order: [['isSystem', 'DESC'], ['name', 'ASC']],
        });
    }

    async getTemplateById(templateId) {
        const template = await GoalTemplate.findByPk(templateId);
        if (!template) throw new AppError('Plantilla no encontrada.', 404);
        return template;
    }
}

module.exports = new TemplateService();
