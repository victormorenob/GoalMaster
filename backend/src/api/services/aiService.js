const db = require('../../config/database');
const { Objective } = db;
const AppError = require('../../utils/AppError');

class AiService {
    async chat(userId, message) {
        if (!message || !message.trim()) {
            throw new AppError('El mensaje no puede estar vacío.', 400);
        }

        const objectives = await Objective.findAll({
            where: { userId },
            attributes: ['name', 'status', 'category', 'currentValue', 'targetValue'],
            limit: 10,
            order: [['updatedAt', 'DESC']],
        });

        const objectiveSummary = objectives.length
            ? objectives.map(o => `- ${o.name} (${o.status}, ${o.category})`).join('\n')
            : 'No tienes objetivos activos aún.';

        const lower = message.toLowerCase();
        let reply;

        if (lower.includes('progreso') || lower.includes('progress')) {
            reply = `Aquí tienes un resumen de tus objetivos recientes:\n${objectiveSummary}\n\n¿Quieres que te sugiera cómo avanzar en alguno?`;
        } else if (lower.includes('motiv') || lower.includes('ánimo')) {
            reply = 'Cada pequeño paso cuenta. Revisa tus metas de hoy y celebra cualquier avance, por mínimo que sea. ¡Tú puedes!';
        } else if (lower.includes('suger') || lower.includes('idea') || lower.includes('objetivo')) {
            reply = 'Te sugiero empezar con un objetivo SMART: específico, medible y con fecha límite. Por ejemplo: "Ahorrar 200€ en 30 días" o "Leer 20 páginas diarias".';
        } else {
            reply = `Entiendo tu consulta sobre "${message.trim()}". Como asistente de GoalMaster, puedo ayudarte con motivación, ideas de objetivos y revisión de progreso. Tus objetivos actuales:\n${objectiveSummary}`;
        }

        return { reply, timestamp: new Date().toISOString() };
    }
}

module.exports = new AiService();
