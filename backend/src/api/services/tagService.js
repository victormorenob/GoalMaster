// backend/src/api/services/tagService.js
const db = require('../../config/database');
const AppError = require('../../utils/AppError');

const { Tag } = db;

class TagService {
    async getAllTags(userId) {
        return Tag.findAll({ where: { userId }, order: [['name', 'ASC']] });
    }

    async getTagById(tagId, userId) {
        const tag = await Tag.findOne({ where: { id: tagId, userId } });
        if (!tag) throw new AppError('Etiqueta no encontrada.', 404);
        return tag;
    }

    async createTag(tagData, userId) {
        if (!userId) throw new AppError('No se proporcionó un ID de usuario autenticado.', 401);

        const existingTag = await Tag.findOne({ where: { name: tagData.name, userId } });
        if (existingTag) throw new AppError('Ya existe una etiqueta con ese nombre.', 409);

        return Tag.create({ ...tagData, userId });
    }

    async updateTag(tagId, userId, updateData) {
        const tag = await Tag.findOne({ where: { id: tagId, userId } });
        if (!tag) throw new AppError('Etiqueta no encontrada.', 404);

        if (updateData.name) {
            const existingTag = await Tag.findOne({
                where: { name: updateData.name, userId, id: { [db.Sequelize.Op.ne]: tagId } }
            });
            if (existingTag) throw new AppError('Ya existe otra etiqueta con ese nombre.', 409);
        }

        await tag.update(updateData);
        return tag;
    }

    async deleteTag(tagId, userId) {
        const tag = await Tag.findOne({ where: { id: tagId, userId } });
        if (!tag) throw new AppError('Etiqueta no encontrada.', 404);
        await tag.destroy();
        return { message: `Etiqueta '${tag.name}' eliminada correctamente.` };
    }
}

module.exports = new TagService();
