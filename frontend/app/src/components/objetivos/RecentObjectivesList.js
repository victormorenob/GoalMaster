import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { FaArrowRight, FaChartLine } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.07, duration: 0.3, ease: 'easeOut' } }),
};

const RecentObjectivesList = ({ objectives }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const dateFnsLocales = { es: es, en: enUS };
    const currentLocale = dateFnsLocales[i18n.language] || enUS;

    if (!objectives || objectives.length === 0) {
        return <p className="text-[var(--muted-foreground)] italic py-4 text-center flex-grow flex items-center justify-center">{t('recentObjectives.noData')}</p>;
    }

    return (
        <div className="flex flex-col h-full">
            <ul className="list-none p-0 m-0 flex-grow overflow-y-auto">
                {objectives.map((obj, i) => (
                    <motion.li
                        key={obj.id}
                        custom={i}
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        className="flex items-center gap-3 p-4 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] mb-3 shadow-[var(--shadow-sm)] transition-colors duration-200 hover:bg-[var(--accent)] last:mb-0"
                    >
                        <div className="text-2xl p-2 rounded-[var(--radius-full)] flex items-center justify-center flex-shrink-0 text-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_15%,transparent)]">
                            <FaChartLine />
                        </div>
                        <div className="flex flex-col gap-[0.1rem] flex-grow min-w-0">
                            <Link to={`/objectives/${obj.id}`} className="font-semibold text-[var(--foreground)] no-underline text-sm whitespace-nowrap overflow-hidden text-ellipsis hover:underline hover:text-[var(--primary)]">
                                {obj.name}
                            </Link>
                            <span className="text-xs text-[var(--muted-foreground)]">
                                {t('recentObjectives.updatedAgo', { distance: formatDistanceToNow(new Date(obj.updatedAt), { addSuffix: false, locale: currentLocale }) })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="font-semibold text-sm text-[var(--primary)] min-w-[35px] text-right">{obj.progressPercentage}%</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/objectives/${obj.id}`)}
                                aria-label={t('recentObjectives.viewDetailsAria', {name: obj.name})}
                                className="text-[var(--muted-foreground)] !p-[0.2rem] hover:text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_15%,transparent)]"
                            >
                                <FaArrowRight />
                            </Button>
                        </div>
                    </motion.li>
                ))}
            </ul>
            <div className="mt-auto pt-4 text-center">
                <Button onClick={() => navigate('/mis-objetivos')} variant="outline" size="small">
                    {t('recentObjectives.viewAllObjectives')}
                </Button>
            </div>
        </div>
    );
};

export default RecentObjectivesList;
