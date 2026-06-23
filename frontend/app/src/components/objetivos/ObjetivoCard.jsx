import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../services/apiService';

import { getCategoryIcon, getStatusInfo } from '../../utils/ObjectiveUtils';
import Button from '../ui/Button';
import { FaEdit, FaEye, FaArchive, FaUndo, FaCalendarAlt } from 'react-icons/fa';
import { formatDateByPreference } from '../../utils/dateUtils';
import { useSettings } from '../../context/SettingsContext';

const categoryKeyMap = {
  HEALTH: 'health',
  FINANCE: 'finance',
  PERSONAL_DEV: 'personalDevelopment',
  RELATIONSHIPS: 'relationships',
  CAREER: 'career',
  OTHER: 'other',
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
  const currentValueDisplay = hasQuantitativeValues
    ? `${(objective.currentValue ?? 0).toLocaleString(settings.language)} ${objective.unit || ''}`
    : 'N/A';
  const targetValueDisplay = hasQuantitativeValues
    ? `${objective.targetValue.toLocaleString(settings.language)} ${objective.unit || ''}`
    : 'N/A';
  const lastUpdated = objective.updatedAt
    ? formatDateByPreference(objective.updatedAt, settings.dateFormat, settings.language)
    : 'N/A';

  const handleViewDetails = (e) => {
    e?.preventDefault();
    navigate(`/objectives/${objective.id}`);
  };

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

  const getProgressColor = (pct) => {
    if (pct < 33) return 'bg-red-500';
    if (pct < 66) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const statusColors = {
    statusOk: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    statusWarning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    statusNeutral: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    statusDanger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  const statusColorClass = statusColors[statusClassName] || statusColors.statusNeutral;

  return (
    <motion.a
      data-cy={`objetivo-card-${objective.id}`}
      href={`/objectives/${objective.id}`}
      onClick={handleViewDetails}
      onKeyPress={(e) => { if (e.key === 'Enter') handleViewDetails(e); }}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${objective.name}`}
      className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <header className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 m-0 leading-snug line-clamp-2">
            {objective.name}
          </h3>
          <div className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium whitespace-nowrap">
            {getCategoryIcon(objective.category)}
            <span>{translatedCategory}</span>
          </div>
        </header>

        {objective.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0 line-clamp-2">
            {objective.description}
          </p>
        )}

        {/* Progress section */}
        {hasQuantitativeValues && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t('common.progress')}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progressPercentage)}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-slate-400 dark:text-slate-500">{t('objectiveCard.current')}</div>
                <div className="font-medium text-slate-700 dark:text-slate-300">{currentValueDisplay}</div>
              </div>
              <div>
                <div className="text-slate-400 dark:text-slate-500">{t('objectiveCard.target')}</div>
                <div className="font-medium text-slate-700 dark:text-slate-300">{targetValueDisplay}</div>
              </div>
            </div>
          </div>
        )}

        {/* Last updated */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <FaCalendarAlt />
          <span>{t('common.updatedLabel')}</span>
          <span className="text-slate-600 dark:text-slate-400">{lastUpdated}</span>
        </div>

        {/* Status badge */}
        <div className={`inline-flex self-start px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}>
          {translatedStatus}
        </div>
      </div>

      {/* Footer actions */}
      <footer className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
        <Button
          data-cy="edit-button"
          variant="outline"
          size="sm"
          onClick={handleEdit}
          leftIcon={<FaEdit />}
          disabled={objective.status === 'ARCHIVED'}
        >
          {t('common.edit')}
        </Button>

        {objective.status === 'ARCHIVED' ? (
          <Button
            data-cy="unarchive-button"
            variant="outline"
            size="sm"
            onClick={handleUnarchive}
            leftIcon={<FaUndo />}
          >
            {t('common.unarchive')}
          </Button>
        ) : (
          <Button
            data-cy="archive-button"
            variant="outline"
            size="sm"
            onClick={handleArchive}
            leftIcon={<FaArchive />}
          >
            {t('common.archive')}
          </Button>
        )}

        <Button
          data-cy="details-button"
          variant="outline"
          size="sm"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewDetails(e); }}
          leftIcon={<FaEye />}
        >
          {t('common.details')}
        </Button>
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
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
  onObjectiveArchived: PropTypes.func,
  onObjectiveUnarchived: PropTypes.func,
};

export default ObjetivoCard;
