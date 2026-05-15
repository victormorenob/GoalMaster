import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const InlineProgressBar = ({ percentage, color }) => (
    <div className="h-2 bg-[var(--muted)] rounded-[var(--radius)] overflow-hidden mt-0.5">
        <div className="h-full transition-[width] duration-300 ease-in-out rounded-[var(--radius)]" style={{ width: `${Math.max(0, Math.min(100, percentage))}%`, backgroundColor: color || 'var(--primary)' }} />
    </div>
);

const CategoryObjectivesCard = ({ categoryName, objectiveCount, objectives, color }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border-light)] p-5 px-6 shadow-[var(--shadow-sm)] flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-ultralight,#f0f0f0)]">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                <h4 className="text-[1.2rem] font-semibold text-[var(--heading-color)] m-0 flex-grow">{categoryName}</h4>
                <span className="text-[0.8rem] text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-[var(--radius-sm)]">{t('common.objective', { count: objectiveCount })}</span>
            </div>
            {objectives && objectives.length > 0 ? (
                <ul className="list-none p-0 m-0 flex flex-col gap-4">
                    {objectives.map(obj => (
                        <li key={obj.id_objetivo || obj.id} className="flex flex-col gap-1">
                            <Link to={`/objectives/${obj.id_objetivo || obj.id}`} className="font-medium text-[var(--link-color)] no-underline text-[0.95rem] hover:underline">
                                {obj.nombre}
                            </Link>
                            <div className="flex justify-between items-center text-[0.85rem] text-[var(--foreground)]">
                                <span className="font-semibold">{Math.round(obj.progreso_calculado)}%</span>
                                {obj.valor_actual !== undefined && obj.valor_cuantitativo !== undefined && obj.unidad_medida &&
                                    <span className="text-[0.75rem] text-[var(--muted-foreground)]">
                                        ({obj.valor_actual}{obj.unidad_medida} / {obj.valor_cuantitativo}{obj.unidad_medida})
                                    </span>
                                }
                            </div>
                            <InlineProgressBar percentage={obj.progreso_calculado} color={color} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-[0.9rem] text-[var(--muted-foreground)] text-center py-4">{t('categoryObjectivesCard.noObjectives')}</p>
            )}
        </div>
    );
};

export default CategoryObjectivesCard;