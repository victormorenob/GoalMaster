import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const InlineProgressBar = ({ percentage, color }) => (
    <motion.div
        className="h-2 bg-[var(--muted)] rounded-[var(--radius)] overflow-hidden mt-[0.2rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <motion.div
            className="h-full rounded-[var(--radius)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ backgroundColor: color || 'var(--primary)' }}
        />
    </motion.div>
);

const CategoryObjectivesCard = ({ categoryName, objectiveCount, objectives, color }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border-light)] p-5 shadow-[var(--shadow-sm)] flex flex-col gap-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-ultralight,#f0f0f0)]">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                <h4 className="text-xl font-semibold text-[var(--heading-color)] m-0 flex-grow">{categoryName}</h4>
                <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-[0.2rem] rounded-[var(--radius-sm)]">{t('common.objective', { count: objectiveCount })}</span>
            </div>
            {objectives && objectives.length > 0 ? (
                <ul className="list-none p-0 m-0 flex flex-col gap-4">
                    {objectives.map(obj => (
                        <li key={obj.id_objetivo || obj.id} className="flex flex-col gap-[0.3rem]">
                            <Link to={`/objectives/${obj.id_objetivo || obj.id}`} className="font-medium text-[var(--link-color)] no-underline text-sm hover:underline">
                                {obj.nombre}
                            </Link>
                            <div className="flex justify-between items-center text-sm text-[var(--foreground)]">
                                <span className="font-semibold">{Math.round(obj.progreso_calculado)}%</span>
                                {obj.valor_actual !== undefined && obj.valor_cuantitativo !== undefined && obj.unidad_medida &&
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                        ({obj.valor_actual}{obj.unidad_medida} / {obj.valor_cuantitativo}{obj.unidad_medida})
                                    </span>
                                }
                            </div>
                            <InlineProgressBar percentage={obj.progreso_calculado} color={color} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">{t('categoryObjectivesCard.noObjectives')}</p>
            )}
        </motion.div>
    );
};

export default CategoryObjectivesCard;
