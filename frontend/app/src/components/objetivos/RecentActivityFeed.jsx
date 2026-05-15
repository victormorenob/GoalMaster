import React from 'react';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  FaPlusCircle, FaCheckCircle, FaTimesCircle, FaArchive,
  FaHistory, FaEdit, FaChartLine, FaTrashAlt, FaUndo, FaCog, FaKey, FaDownload, FaUserTimes
} from 'react-icons/fa';

const activityIcons = {
  OBJECTIVE_CREATED: <FaPlusCircle className="text-emerald-500" />,
  PROGRESS_UPDATED: <FaChartLine className="text-blue-500" />,
  OBJECTIVE_COMPLETED: <FaCheckCircle className="text-emerald-500" />,
  OBJECTIVE_FAILED: <FaTimesCircle className="text-red-500" />,
  OBJECTIVE_ARCHIVED: <FaArchive className="text-slate-400" />,
  OBJECTIVE_DELETED: <FaTrashAlt className="text-red-500" />,
  OBJECTIVE_STATUS_CHANGED: <FaEdit className="text-amber-500" />,
  OBJECTIVE_UNARCHIVED: <FaUndo className="text-blue-500" />,
  USER_SETTINGS_UPDATED: <FaCog className="text-indigo-500" />,
  USER_PASSWORD_CHANGED: <FaKey className="text-amber-500" />,
  USER_DATA_EXPORTED: <FaDownload className="text-blue-500" />,
  USER_ACCOUNT_DELETED: <FaUserTimes className="text-red-500" />,
  DEFAULT: <FaHistory className="text-slate-400" />,
};

const toCamelCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

const RecentActivityFeed = ({ activities }) => {
  const { t, i18n } = useTranslation();
  const dateFnsLocales = { es, en: enUS };
  const currentLocale = dateFnsLocales[i18n.language] || enUS;

  if (!activities || activities.length === 0) {
    return (
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
        {t('activityFeed.noRecentActivity')}
      </p>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <ul className="list-none p-0 m-0 flex flex-col gap-1">
        {activities.map((act) => {
          const translationKey = act.descriptionKey;
          let params = {};
          try {
            if (typeof act.additionalDetails === 'string') {
              params = JSON.parse(act.additionalDetails);
            } else {
              params = act.additionalDetails || {};
            }
          } catch (e) {
            console.error('Error al parsear detalles_adicionales:', e);
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
            <li
              key={act.id}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="shrink-0 mt-0.5">{activityIcons[act.activityType] || activityIcons.DEFAULT}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
                  {translatedDescription}
                </p>
                {timeAgo && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    {timeAgo}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentActivityFeed;
