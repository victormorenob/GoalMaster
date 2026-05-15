// backend/src/api/models/tag.js
const { DataTypes } = require('sequelize');

/**
 * Defines the Tag model.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {ModelCtor<Model>} The Tag model.
 */
module.exports = (sequelize) => {
    const Tag = sequelize.define("Tag", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: { notEmpty: { msg: "El nombre de la etiqueta no puede estar vacío." } },
            field: 'nombre'
        },
        color: {
            type: DataTypes.STRING(7),
            allowNull: false,
            defaultValue: '#3b82f6',
            validate: {
                is: /^#[0-9A-Fa-f]{6}$/,
            },
            field: 'color'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'usuario', key: 'id' },
            field: 'id_usuario'
        },
    }, {
        tableName: 'etiqueta',
        timestamps: true,
        underscored: true,
    });

    Tag.associate = (models) => {
        Tag.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
    };

    return Tag;
};
