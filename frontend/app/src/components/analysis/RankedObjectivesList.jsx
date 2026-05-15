import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const InlineProgressBar = ({ percentage, color }) => {
    return (
        <div className="h-[6px] bg-[var(--muted)] rounded-[var(--radius)] overflow-hidden mt-1">
            <div
                className="h-full transition-[width] duration-300 ease-in-out rounded-[var(--radius)]"
                style={{ width: `${Math.max(0, Math.min(100, percentage))}%`, backgroundColor: color || 'var(--primary)' }}
            />
        </div>
    );
};

const RankedObjectivesList = ({ title, objectives, noDataMessage }) => {
    const { t } = useTranslation();

    if (!objectives || objectives.length === 0) {
        return (
            <div className="bg-[var(--card)] p-5 px-6 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col">
                <h4 className="text-[1.1rem] font-semibold text-[var(--foreground)] m-0 mb-4">{title}</h4>
                <p className="text-[var(--muted-foreground)] text-[0.9rem] text-center py-4">{noDataMessage || t('rankedObjectivesList.noData')}</p>
            </div>
        );
    }

    return (
        <div className="bg-[var(--card)] p-5 px-6 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col">
            <h4 className="text-[1.1rem] font-semibold text-[var(--foreground)] m-0 mb-4">{title}</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {objectives.map(obj => (
                    <li key={obj.id_objetivo || obj.id} className="pb-2 border-b border-[var(--border-ultralight)] last:border-none last:pb-0">
                        <Link to={`/objectives/${obj.id_objetivo || obj.id}`} className="flex justify-between items-center no-underline text-[var(--foreground)] px-0.5 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--muted)]">
                            <div className="flex flex-col gap-0.5 flex-grow mr-2">
                                <span className="font-medium text-[0.9rem] text-[var(--foreground)]">{obj.nombre}</span>
                                {obj.tipo_objetivo && <span className="text-[0.75rem] text-[var(--muted-foreground)]">{obj.tipo_objetivo}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-right">
                                <span className="text-[0.95rem] font-semibold text-[var(--primary)] min-w-[35px]">{Math.round(obj.progreso_calculado)}%</span>
                            </div>
                        </Link>
                        <InlineProgressBar percentage={obj.progreso_calculado} color={obj.color} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RankedObjectivesList;