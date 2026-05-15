import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const InlineProgressBar = ({ percentage, color }) => {
    return (
        <div className="h-[6px] bg-[var(--muted)] rounded-[var(--radius)] overflow-hidden mt-[0.3rem]">
            <motion.div
                className="h-full rounded-[var(--radius)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ backgroundColor: color || 'var(--primary)' }}
            />
        </div>
    );
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06, duration: 0.25, ease: 'easeOut' } }),
};

const RankedObjectivesList = ({ title, objectives, noDataMessage }) => {
    const { t } = useTranslation();

    if (!objectives || objectives.length === 0) {
        return (
            <div className="bg-[var(--card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col">
                <h4 className="text-lg font-semibold text-[var(--foreground)] m-0 mb-4">{title}</h4>
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">{noDataMessage || t('rankedObjectivesList.noData')}</p>
            </div>
        );
    }

    return (
        <motion.div
            className="bg-[var(--card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h4 className="text-lg font-semibold text-[var(--foreground)] m-0 mb-4">{title}</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {objectives.map((obj, i) => (
                    <motion.li
                        key={obj.id_objetivo || obj.id}
                        custom={i}
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        className="pb-2 border-b border-[var(--border-ultralight)] last:border-b-0 last:pb-0"
                    >
                        <Link to={`/objectives/${obj.id_objetivo || obj.id}`} className="flex justify-between items-center no-underline text-[var(--foreground)] px-[0.1rem] py-[0.3rem] rounded-[var(--radius-sm)] transition-colors duration-200 hover:bg-[var(--muted)]">
                            <div className="flex flex-col gap-[0.1rem] flex-grow mr-2">
                                <span className="font-medium text-sm text-[var(--foreground)]">{obj.nombre}</span>
                                {obj.tipo_objetivo && <span className="text-xs text-[var(--muted-foreground)]">{obj.tipo_objetivo}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-right">
                                <span className="text-sm font-semibold text-[var(--primary)] min-w-[35px]">{Math.round(obj.progreso_calculado)}%</span>
                            </div>
                        </Link>
                        <InlineProgressBar percentage={obj.progreso_calculado} color={obj.color} />
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

export default RankedObjectivesList;
