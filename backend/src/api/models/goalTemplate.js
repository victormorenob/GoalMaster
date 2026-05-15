// backend/src/api/models/goalTemplate.js
const { DataTypes } = require('sequelize');
const { ALLOWED_CATEGORIES } = require('../../shared/constants');

/**
 * Defines the GoalTemplate model for predefined goal templates.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {ModelCtor<Model>} The GoalTemplate model.
 */
module.exports = (sequelize) => {
    const GoalTemplate = sequelize.define("GoalTemplate", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'nombre'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'descripcion'
        },
        category: {
            type: DataTypes.ENUM(...ALLOWED_CATEGORIES),
            allowNull: false,
            field: 'categoria'
        },
        targetValue: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            field: 'valor_objetivo'
        },
        unit: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'unidad_medida'
        },
        isQuantitative: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'es_cuantitativo'
        },
    }, {
        tableName: 'plantilla_objetivo',
        timestamps: true,
        underscored: true,
    });

    return GoalTemplate;
};

/**
 * Pre-populate templates if the table is empty.
 * @param {Sequelize} sequelize - The Sequelize instance.
 */
module.exports.seedTemplates = async (sequelize) => {
    const GoalTemplate = sequelize.models.GoalTemplate;
    if (!GoalTemplate) return;

    const count = await GoalTemplate.count();
    if (count > 0) return;

    const templates = [
        // HEALTH
        { name: 'Run 5K', description: 'Complete a 5K run', category: 'HEALTH', targetValue: 5, unit: 'km', isQuantitative: true },
        { name: 'Meditate daily', description: 'Meditate every day for mindfulness', category: 'HEALTH', isQuantitative: false },
        { name: 'Drink 8 glasses of water', description: 'Stay hydrated by drinking 8 glasses of water daily', category: 'HEALTH', targetValue: 8, unit: 'glasses', isQuantitative: true },
        { name: 'Sleep 8 hours', description: 'Get 8 hours of sleep per night', category: 'HEALTH', targetValue: 8, unit: 'hours', isQuantitative: true },
        // FINANCE
        { name: 'Save $1000', description: 'Save $1000 for your emergency fund', category: 'FINANCE', targetValue: 1000, unit: 'USD', isQuantitative: true },
        { name: 'Create emergency fund', description: 'Build an emergency fund covering 3 months of expenses', category: 'FINANCE', isQuantitative: false },
        { name: 'Track daily expenses', description: 'Log and review all expenses every day', category: 'FINANCE', isQuantitative: false },
        // PERSONAL_DEV
        { name: 'Read 12 books', description: 'Read 12 books in a year (one per month)', category: 'PERSONAL_DEV', targetValue: 12, unit: 'books', isQuantitative: true },
        { name: 'Learn a new language', description: 'Achieve conversational level in a new language', category: 'PERSONAL_DEV', isQuantitative: false },
        { name: 'Practice coding daily', description: 'Code every day to improve programming skills', category: 'PERSONAL_DEV', isQuantitative: false },
        // CAREER
        { name: 'Complete a certification', description: 'Earn a professional certification in your field', category: 'CAREER', isQuantitative: false },
        { name: 'Network with 5 professionals', description: 'Connect with 5 professionals in your industry', category: 'CAREER', targetValue: 5, unit: 'connections', isQuantitative: true },
        { name: 'Update portfolio', description: 'Refresh your professional portfolio with latest work', category: 'CAREER', isQuantitative: false },
        // RELATIONSHIPS
        { name: 'Call a friend weekly', description: 'Call a friend every week to stay connected', category: 'RELATIONSHIPS', isQuantitative: false },
        { name: 'Date night weekly', description: 'Have a weekly date night with your partner', category: 'RELATIONSHIPS', isQuantitative: false },
        { name: 'Volunteer monthly', description: 'Volunteer for a cause you care about once a month', category: 'RELATIONSHIPS', isQuantitative: false },
    ];

    await GoalTemplate.bulkCreate(templates);
    console.log(`[DB] Seeded ${templates.length} goal templates.`);
};
