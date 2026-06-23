import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { FaArrowRight, FaChartLine } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const RecentObjectivesList = ({ objectives }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const dateFnsLocales = { es, en: enUS };
  const currentLocale = dateFnsLocales[i18n.language] || enUS;

  if (!objectives || objectives.length === 0) {
    return (
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
        {t('recentObjectives.noData')}
      </p>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ul className="list-none p-0 m-0 flex flex-col gap-1 flex-1 overflow-y-auto">
        {objectives.map((obj) => (
          <li
            key={obj.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="text-indigo-500 dark:text-indigo-400 shrink-0">
              <FaChartLine />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                to={`/objectives/${obj.id}`}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 no-underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
              >
                {obj.name}
              </Link>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                {t('recentObjectives.updatedAgo', {
                  distance: formatDistanceToNow(new Date(obj.updatedAt), {
                    addSuffix: false,
                    locale: currentLocale,
                  }),
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {obj.progressPercentage}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/objectives/${obj.id}`)}
                aria-label={t('recentObjectives.viewDetailsAria', { name: obj.name })}
              >
                <FaArrowRight />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-center pt-3 border-t border-slate-100 dark:border-slate-700 mt-2">
        <Button onClick={() => navigate('/mis-objetivos')} variant="outline" size="sm">
          {t('recentObjectives.viewAllObjectives')}
        </Button>
      </div>
    </div>
  );
};

export default RecentObjectivesList;
