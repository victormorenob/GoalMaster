import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/apiService';

import { getCategoryIcon, getStatusInfo } from '../../utils/ObjectiveUtils';
import Button from '../ui/Button';
import { FaEdit, FaEye, FaArchive, FaUndo, FaCalendarAlt } from 'react-icons/fa';
import { formatDateByPreference } from '../../utils/dateUtils';
import { useSettings } from '../../context/SettingsContext';
import TagBadge from '../tags/TagBadge';

const categoryKeyMap = {
    HEALTH: "health",
    FINANCE: "finance",
    PERSONAL_DEV: "personalDevelopment",
    RELATIONSHIPS: "relationships",
    CAREER: "career",
    OTHER: "other",
};

const progressFillClasses = {
    low: 'bg-[var(--destructive)]',
    medium: 'bg-[var(--warning)]',
    high: 'bg-[var(--secondary)]',
};

const getProgressClass = (percentage) => {
    if (percentage < 33) return progressFillClasses.low;
    if (percentage < 66) return progressFillClasses.medium;
    return progressFillClasses.high;
};

function ObjetivoCard({ objective, onObjectiveArchived, onObjectiveUnarchived }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useSettings();

    const progressPercentage = Math.round(objective.progressPercentage || 0);
    const { translatedStatus, statusClassName } = getStatusInfo(objective.status, t);
    const categoryTranslationKey = categoryKeyMap[objective.category] || 'other';
    const translatedCategory = t(`categories.${categoryTranslationKey}`);
    const hasQuantitativeValues = objective.initialValue != null && objective.targetValue != null;
    const currentValueDisplay = hasQuantitativeValues ? `${(objective.currentValue ?? 0).toLocaleString(settings.language)} ${objective.unit || ''}` : 'N/A';
    const targetValueDisplay = hasQuantitativeValues ? `${objective.targetValue.toLocaleString(settings.language)} ${objective.unit || ''}` : 'N/A';
    const lastUpdated = objective.updatedAt ? formatDateByPreference(objective.updatedAt, settings.dateFormat, settings.language) : 'N/A';

    const handleViewDetails = () => navigate(`/objectives/${objective.id}`);

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/objectives/edit/${objective.id}`);
    };

    const handleArchive = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(t('confirmationDialog.archiveObjective', { name: objective.name }))) {
            try {
                await api.updateObjective(objective.id, { status: 'ARCHIVED' });
                toast.success(t('toast.objectiveArchiveSuccess'));
                if (onObjectiveArchived) onObjectiveArchived();
            } catch (error) {
                toast.error(error.message || t('toast.objectiveArchiveError'));
            }
        }
    };

    const handleUnarchive = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(t('confirmationDialog.unarchiveObjective', { name: objective.name }))) {
            try {
                await api.unarchiveObjective(objective.id);
                toast.success(t('toast.objectiveUnarchiveSuccess'));
                if (onObjectiveUnarchived) onObjectiveUnarchived();
            } catch (error) {
                toast.error(error.message || t('toast.objectiveUnarchiveError'));
            }
        }
    };

    const statusClasses = {
        statusPending: 'text-[var(--warning-foreground-strong)] bg-[var(--warning-background-soft)] border border-[var(--warning-border)]',
        statusInprogress: 'text-[var(--primary)] bg-[var(--primary-soft-bg)] border border-[color-mix(in_srgb,var(--primary)_20%,transparent)]',
        statusCompleted: 'text-[var(--success-strong-text)] bg-[var(--success-soft-bg)] border border-[color-mix(in_srgb,var(--success)_20%,transparent)]',
        statusFailed: 'text-[var(--destructive)] bg-[var(--destructive-soft-bg)] border border-[color-mix(in_srgb,var(--destructive)_20%,transparent)]',
        statusArchived: 'text-[var(--muted-foreground)] bg-[var(--muted)] border border-[var(--border-light)]',
    };

    return (
        <motion.a
            data-cy={`objetivo-card-${objective.id}`}
            href={`/objectives/${objective.id}`}
            className="border border-[var(--border)] rounded-[var(--radius)] bg-[var(--card)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-300 max-w-[400px] w-full"
            onClick={handleViewDetails}
            onKeyPress={(e) => { if (e.key === 'Enter') handleViewDetails(e); }}
            role="button"
            tabIndex="0"
            aria-label={`Ver detalles de ${objective.name}`}
            whileHover={{ y: -4, boxShadow: '0 6px 12px rgba(0,0,0,0.15)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="p-6 flex flex-col gap-5 flex-grow last:gap-0">
                <header className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-[var(--card-foreground)] m-0 leading-tight tracking-tight flex-grow min-w-0 break-words line-clamp-3">{objective.name}</h3>
                    <div className="inline-flex items-center justify-center gap-[0.3rem] px-4 py-[0.4rem] rounded-full text-sm font-semibold leading-none whitespace-nowrap bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        {getCategoryIcon(objective.category)}
                        <span>{translatedCategory}</span>
                    </div>
                </header>

                {objective.description && <p className="text-sm text-[var(--muted-foreground)] m-0 leading-relaxed max-h-[4.8em] overflow-hidden text-ellipsis line-clamp-3 [&_p]:m-0">{objective.description}</p>}

                {objective.tags && objective.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                        {objective.tags.map((tag) => (
                            <TagBadge key={tag} name={tag} size="small" />
                        ))}
                    </div>
                )}

                {hasQuantitativeValues && (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-[var(--foreground)]">
                            <span>{t('common.progress')}</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="bg-[var(--muted)] rounded-full overflow-hidden h-[0.6rem] w-full">
                            <motion.div
                                className={`h-full rounded-full ${getProgressClass(progressPercentage)}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-[0.4rem]">
                            <div className="flex flex-col">
                                <div className="text-xs text-[var(--muted-foreground)] font-medium mb-[0.15rem]">{t('objectiveCard.current')}</div>
                                <div className="text-base font-bold text-[var(--card-foreground)]">{currentValueDisplay}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-xs text-[var(--muted-foreground)] font-medium mb-[0.15rem]">{t('objectiveCard.target')}</div>
                                <div className="text-base font-bold text-[var(--card-foreground)]">{targetValueDisplay}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-[0.4rem] text-sm text-[var(--muted-foreground)] mt-[0.4rem]">
                    <FaCalendarAlt className="text-[1.1em]" />
                    <span className="font-semibold">{t('common.updatedLabel')}</span>
                    <span className="font-normal">{lastUpdated}</span>
                </div>

                <div className={`px-[0.8em] py-[0.3em] rounded text-sm font-semibold text-center mt-2 ${statusClasses[statusClassName] || ''}`}>
                    {translatedStatus}
                </div>
            </div>

            <footer className="px-6 py-4 border-t border-[var(--border)] flex justify-end items-center mt-auto">
                <div className="flex gap-[0.8rem]">
                    <Button data-cy="edit-button" className="inline-flex items-center justify-center gap-[0.35rem] px-4 py-[0.4rem] rounded-[var(--radius)] text-sm font-medium cursor-pointer transition-all duration-200 border-none bg-transparent text-inherit border border-[var(--border)] text-[var(--foreground)] bg-transparent hover:bg-[var(--muted)] hover:border-[var(--muted-foreground)]" variant="outline" size="small" onClick={handleEdit} leftIcon={<FaEdit />} disabled={objective.status === 'ARCHIVED'}>{t('common.edit')}</Button>

                    {objective.status === 'ARCHIVED' ? (
                        <Button data-cy="unarchive-button" className="inline-flex items-center justify-center gap-[0.35rem] px-4 py-[0.4rem] rounded-[var(--radius)] text-sm font-medium cursor-pointer transition-all duration-200 border-none bg-transparent text-inherit border border-[var(--border)] text-[var(--foreground)] bg-transparent hover:bg-[var(--muted)] hover:border-[var(--muted-foreground)]" variant="outline" size="small" onClick={handleUnarchive} leftIcon={<FaUndo />}>{t('common.unarchive')}</Button>
                    ) : (
                        <Button data-cy="archive-button" className="inline-flex items-center justify-center gap-[0.35rem] px-4 py-[0.4rem] rounded-[var(--radius)] text-sm font-medium cursor-pointer transition-all duration-200 border-none bg-transparent text-inherit border border-[var(--border)] text-[var(--foreground)] bg-transparent hover:bg-[var(--muted)] hover:border-[var(--muted-foreground)]" variant="outline" size="small" onClick={handleArchive} leftIcon={<FaArchive />}>{t('common.archive')}</Button>
                    )}

                    <Button data-cy="details-button" className="inline-flex items-center justify-center gap-[0.35rem] px-4 py-[0.4rem] rounded-[var(--radius)] text-sm font-medium cursor-pointer transition-all duration-200 border-none bg-transparent text-inherit border border-[var(--border)] text-[var(--foreground)] bg-transparent hover:bg-[var(--muted)] hover:border-[var(--muted-foreground)]" variant="outline" size="small" onClick={handleViewDetails} leftIcon={<FaEye />}>{t('common.details')}</Button>
                </div>
            </footer>
        </motion.a>
    );
}

ObjetivoCard.propTypes = {
    objective: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        category: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        progressPercentage: PropTypes.number,
        initialValue: PropTypes.number,
        targetValue: PropTypes.number,
        currentValue: PropTypes.number,
        unit: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        updatedAt: PropTypes.string.isRequired,
    }).isRequired,
    onObjectiveArchived: PropTypes.func,
    onObjectiveUnarchived: PropTypes.func,
};

export default ObjetivoCard;
