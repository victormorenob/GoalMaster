// backend/src/api/models/objectives.js
const { DataTypes } = require('sequelize');
const { ALLOWED_CATEGORIES, ALLOWED_STATUSES, PREVIOUS_STATUSES } = require('../../shared/constants');

/**
 * Defines the Objective model.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {ModelCtor<Model>} The Objective model.
 */
module.exports = (sequelize) => {
    const Objective = sequelize.define("Objective", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: { notEmpty: { msg: "El nombre no puede estar vacío." } },
            field: 'nombre'
        },
        description: {
            type: DataTypes.TEXT,
            field: 'descripcion'
        },
        category: {
            type: DataTypes.ENUM(...ALLOWED_CATEGORIES),
            allowNull: false,
            field: 'tipo_objetivo'
        },
        initialValue: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            field: 'valor_inicial_numerico'
        },
        currentValue: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            defaultValue: 0,
            field: 'valor_actual'
        },
        targetValue: {
            type: DataTypes.DECIMAL,
            allowNull: true,
            field: 'valor_cuantitativo'
        },
        isLowerBetter: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'es_menor_mejor'
        },
        unit: {
            type: DataTypes.STRING(50),
            field: 'unidad_medida'
        },
        startDate: {
            type: DataTypes.DATEONLY,
            field: 'fecha_inicio'
        },
        endDate: {
            type: DataTypes.DATEONLY,
            field: 'fecha_fin'
        },
        status: {
            type: DataTypes.ENUM(...ALLOWED_STATUSES),
            defaultValue: 'PENDING',
            allowNull: false,
            field: 'estado'
        },
        previousStatus: {
            type: DataTypes.ENUM(...PREVIOUS_STATUSES),
            allowNull: true,
            defaultValue: null,
            field: 'estado_anterior',
            comment: 'Stores the previous status before the objective was archived.'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'usuario', key: 'id' },
            field: 'id_usuario'
        },
    }, {
        tableName: 'objetivo',
        timestamps: true,
        underscored: true,
    });

    Objective.associate = (models) => {
        Objective.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
        Objective.hasMany(models.Progress, { foreignKey: 'objectiveId', as: 'progressEntries', onDelete: 'CASCADE' });
    };

    return Objective;
};