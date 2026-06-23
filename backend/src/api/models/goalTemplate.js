// backend/src/api/models/goalTemplate.js
const { DataTypes } = require('sequelize');
const { ALLOWED_CATEGORIES } = require('../../shared/constants');

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

module.exports.seedTemplates = async (sequelize) => {
    const GoalTemplate = sequelize.models.GoalTemplate;
    if (!GoalTemplate) return;

    const count = await GoalTemplate.count();
    if (count > 0) return;

    const templates = [
        { name: 'Run 5K', description: 'Complete a 5K run', category: 'HEALTH', targetValue: 5, unit: 'km', isQuantitative: true },
        { name: 'Meditate daily', description: 'Meditate every day for mindfulness', category: 'HEALTH', isQuantitative: false },
        { name: 'Save $1000', description: 'Save $1000 for your emergency fund', category: 'FINANCE', targetValue: 1000, unit: 'USD', isQuantitative: true },
        { name: 'Read 12 books', description: 'Read 12 books in a year', category: 'PERSONAL_DEV', targetValue: 12, unit: 'books', isQuantitative: true },
        { name: 'Complete a certification', description: 'Earn a professional certification', category: 'CAREER', isQuantitative: false },
        { name: 'Call a friend weekly', description: 'Stay connected with friends', category: 'RELATIONSHIPS', isQuantitative: false },
    ];

    await GoalTemplate.bulkCreate(templates);
    console.log(`[DB] Seeded ${templates.length} goal templates.`);
};
