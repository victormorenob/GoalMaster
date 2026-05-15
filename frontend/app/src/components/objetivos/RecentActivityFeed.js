import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
    FaPlusCircle, FaCheckCircle, FaTimesCircle, FaArchive,
    FaHistory, FaEdit, FaChartLine, FaTrashAlt, FaUndo, FaCog, FaKey, FaDownload, FaUserTimes
} from 'react-icons/fa';

const activityIcons = {
    OBJECTIVE_CREATED: <FaPlusCircle style={{ color: 'var(--success)' }} />,
    PROGRESS_UPDATED: <FaChartLine style={{ color: 'var(--info)' }} />,
    OBJECTIVE_COMPLETED: <FaCheckCircle style={{ color: 'var(--success)' }} />,
    OBJECTIVE_FAILED: <FaTimesCircle style={{ color: 'var(--destructive)' }} />,
    OBJECTIVE_ARCHIVED: <FaArchive style={{ color: 'var(--muted-foreground)' }} />,
    OBJECTIVE_DELETED: <FaTrashAlt style={{ color: 'var(--destructive)' }} />,
    OBJECTIVE_STATUS_CHANGED: <FaEdit style={{ color: 'var(--warning)' }} />,
    OBJECTIVE_UNARCHIVED: <FaUndo style={{ color: 'var(--info)' }} />,
    USER_SETTINGS_UPDATED: <FaCog style={{ color: 'var(--primary)' }} />,
    USER_PASSWORD_CHANGED: <FaKey style={{ color: 'var(--warning)' }} />,
    USER_DATA_EXPORTED: <FaDownload style={{ color: 'var(--info)' }} />,
    USER_ACCOUNT_DELETED: <FaUserTimes style={{ color: 'var(--destructive)' }} />,
    DEFAULT: <FaHistory style={{ color: 'var(--muted-foreground)' }} />
};

const toCamelCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' } }),
};

const RecentActivityFeed = ({ activities }) => {
    const { t, i18n } = useTranslation();
    const dateFnsLocales = { es: es, en: enUS };
    const currentLocale = dateFnsLocales[i18n.language] || enUS;

    if (!activities || activities.length === 0) {
        return <p className="text-[var(--muted-foreground)] italic py-4 text-center flex-grow flex items-center justify-center">{t('activityFeed.noRecentActivity')}</p>;
    }

    return (
        <div className="flex flex-col flex-grow min-h-0">
            <ul className="list-none p-0 m-0">
                {activities.map((act, index) => {
                    const translationKey = act.descriptionKey;
                    let params = {};
                    try {
                        if (typeof act.additionalDetails === 'string') {
                            params = JSON.parse(act.additionalDetails);
                        } else {
                            params = act.additionalDetails || {};
                        }
                    } catch (e) {
                        console.error("Error al parsear detalles_adicionales:", e);
                        params = {};
                    }

                    if (params.oldStatus) {
                        const camelCaseStatus = toCamelCase(params.oldStatus);
                        params.oldStatus = t(`status.${camelCaseStatus}`, params.oldStatus);
                    }
                    if (params.newStatus) {
                        const camelCaseStatus = toCamelCase(params.newStatus);
                        params.newStatus = t(`status.${camelCaseStatus}`, params.newStatus);
                    }

                    const translatedDescription = t(translationKey, params);

                    const date = act.createdAt ? parseISO(act.createdAt) : null;
                    let timeAgo = '';
                    if (date && isValid(date)) {
                        timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: currentLocale });
                    }

                    return (
                        <motion.li
                            key={act.id}
                            custom={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="show"
                            className="flex gap-3 px-[0.2rem] py-3 border-b border-[var(--border-ultralight,#f7f7f7)] last:border-b-0"
                        >
                            <div className="text-xl mt-[0.1rem]">
                                {activityIcons[act.activityType] || activityIcons.DEFAULT}
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm text-[var(--foreground)] m-0 mb-[0.2rem] leading-normal">
                                    {translatedDescription}
                                </p>
                                {timeAgo && (
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                        {timeAgo}
                                    </span>
                                )}
                            </div>
                        </motion.li>
                    );
                })}
            </ul>
        </div>
    );
};

export default RecentActivityFeed;
