// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/apiService';
import styles from './ObjetivoCard.module.css';

import { getCategoryIcon, getStatusInfo } from '../../utils/ObjectiveUtils';
import Button from '../ui/Button';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { FaEdit, FaEye, FaArchive, FaUndo, FaCalendarAlt } from 'react-icons/fa';
import { formatDateByPreference } from '../../utils/dateUtils';
import { useSettings } from '../../context/SettingsContext';

const categoryKeyMap = {
    HEALTH: "health",
    FINANCE: "finance",
    PERSONAL_DEV: "personalDevelopment",
    RELATIONSHIPS: "relationships",
    CAREER: "career",
    OTHER: "other",
};

const getProgressClass = (percentage) => {
    if (percentage < 33) return styles.progressFillLow;
    if (percentage < 66) return styles.progressFillMedium;
    return styles.progressFillHigh;
};

function ObjetivoCard({ objective, onObjectiveArchived, onObjectiveUnarchived }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useSettings();
    const [confirmAction, setConfirmAction] = useState(null);

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
    
    const handleArchive = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmAction('archive');
    };

    const handleUnarchive = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmAction('unarchive');
    };

    const executeConfirm = async () => {
        try {
            if (confirmAction === 'archive') {
                await api.updateObjective(objective.id, { status: 'ARCHIVED' });
                toast.success(t('toast.objectiveArchiveSuccess'));
                if (onObjectiveArchived) onObjectiveArchived();
            } else if (confirmAction === 'unarchive') {
                await api.unarchiveObjective(objective.id);
                toast.success(t('toast.objectiveUnarchiveSuccess'));
                if (onObjectiveUnarchived) onObjectiveUnarchived();
            }
        } catch (error) {
            toast.error(error.message || t('toast.objectiveArchiveError'));
        } finally {
            setConfirmAction(null);
        }
    };

    return (
        <a data-cy={`objetivo-card-${objective.id}`} href={`/objectives/${objective.id}`} className={styles.objetivoCard} onClick={handleViewDetails} onKeyPress={(e) => { if (e.key === 'Enter') handleViewDetails(e); }} role="button" tabIndex="0" aria-label={`Ver detalles de ${objective.name}`}>
            <div className={styles.cardContent}>
                <header className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{objective.name}</h3>
                    <div className={styles.categoryBadge}>
                        {getCategoryIcon(objective.category)}
                        <span>{translatedCategory}</span>
                    </div>
                </header>

                {objective.description && <p className={styles.cardDescription}>{objective.description}</p>}
                
                {hasQuantitativeValues && (
                    <div className={styles.progressContainer}>
                        <div className={styles.progressHeader}>
                            <span>{t('common.progress')}</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={`${styles.progressFill} ${getProgressClass(progressPercentage)}`} style={{ width: `${progressPercentage}%` }} />
                        </div>
                        <div className={styles.progressValues}>
                            <div className={styles.progressValueBox}>
                                <div className={styles.progressValueLabel}>{t('objectiveCard.current')}</div>
                                <div className={styles.progressValueNumber}>{currentValueDisplay}</div>
                            </div>
                            <div className={styles.progressValueBox}>
                                <div className={styles.progressValueLabel}>{t('objectiveCard.target')}</div>
                                <div className={styles.progressValueNumber}>{targetValueDisplay}</div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className={styles.progressDate}>
                    <FaCalendarAlt className={styles.dataIcon} />
                    <span className={styles.dataLabel}>{t('common.updatedLabel')}</span>
                    <span className={styles.dataValue}>{lastUpdated}</span>
                </div>

                <div className={`${styles.cardStatus} ${styles[statusClassName]}`}>
                    {translatedStatus}
                </div>
            </div>

            <footer className={styles.cardFooter}>
                <div className={styles.cardActions}>
                    <Button data-cy="edit-button" className={`${styles.button} ${styles.buttonOutline} ${styles.buttonSmall}`} variant="outline" size="small" onClick={handleEdit} leftIcon={<FaEdit />} disabled={objective.status === 'ARCHIVED'}>{t('common.edit')}</Button>
                    
                    {objective.status === 'ARCHIVED' ? (
                        <Button data-cy="unarchive-button" className={`${styles.button} ${styles.buttonOutline} ${styles.buttonSmall}`} variant="outline" size="small" onClick={handleUnarchive} leftIcon={<FaUndo />}>{t('common.unarchive')}</Button>
                    ) : (
                        <Button data-cy="archive-button" className={`${styles.button} ${styles.buttonOutline} ${styles.buttonSmall}`} variant="outline" size="small" onClick={handleArchive} leftIcon={<FaArchive />}>{t('common.archive')}</Button>
                    )}

                    <Button data-cy="details-button" className={`${styles.button} ${styles.buttonOutline} ${styles.buttonSmall} ${styles.buttonArchive}`} variant="outline" size="small" onClick={handleViewDetails} leftIcon={<FaEye />}>{t('common.details')}</Button>
                </div>
            </footer>
            <ConfirmationDialog
                isOpen={!!confirmAction}
                title={confirmAction === 'archive' ? t('confirmationDialog.archiveTitle', { defaultValue: 'Archivar objetivo' }) : t('confirmationDialog.unarchiveTitle', { defaultValue: 'Desarchivar objetivo' })}
                message={confirmAction === 'archive'
                    ? t('confirmationDialog.archiveObjective', { name: objective.name })
                    : t('confirmationDialog.unarchiveObjective', { name: objective.name })}
                onConfirm={executeConfirm}
                onClose={() => setConfirmAction(null)}
                confirmButtonVariant={confirmAction === 'archive' ? 'destructive' : 'primary'}
            />
        </a>
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
        updatedAt: PropTypes.string.isRequired,
    }).isRequired,
    onObjectiveArchived: PropTypes.func,
    onObjectiveUnarchived: PropTypes.func,
};

export default ObjetivoCard;