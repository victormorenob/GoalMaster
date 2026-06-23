// frontend/app/src/layouts/AppHeader.jsx
import React from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../utils/routePaths';
import { HiMenu, HiLogout } from 'react-icons/hi';

const AppHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const getHeaderTitle = (pathname) => {
    const titleMap = {
      [ROUTE_PATHS.DASHBOARD]: t('pageTitles.dashboard'),
      [ROUTE_PATHS.NEW_OBJECTIVE]: t('pageTitles.createObjective'),
      [ROUTE_PATHS.MY_OBJECTIVES]: t('pageTitles.myObjectives'),
      [ROUTE_PATHS.ANALYSIS]: t('pageTitles.analysis'),
      [ROUTE_PATHS.PROFILE]: t('pageTitles.profile'),
      [ROUTE_PATHS.SETTINGS]: t('pageTitles.settings'),
    };

    if (titleMap[pathname]) return titleMap[pathname];
    if (matchPath(ROUTE_PATHS.EDIT_OBJECTIVE, pathname)) return t('pageTitles.editObjective');
    if (matchPath(ROUTE_PATHS.UPDATE_PROGRESS, pathname)) return t('pageTitles.updateProgress');
    if (matchPath(ROUTE_PATHS.VIEW_OBJECTIVE, pathname)) return t('pageTitles.objectiveDetails');

    return t('common.appName');
  };

  const pageTitle = getHeaderTitle(location.pathname);

  const handleLogout = () => {
    logout();
    toast.success(t('toast.logoutSuccess'));
    navigate(ROUTE_PATHS.LOGIN, { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="flex flex-col justify-around w-6 h-6 bg-transparent border-none cursor-pointer p-0 z-20 shrink-0 md:hidden"
          onClick={onMenuClick}
          aria-label={t('header.openMenu')}
        >
          <span className="w-6 h-0.5 bg-slate-700 dark:bg-slate-300 rounded transition-all duration-200" />
          <span className="w-6 h-0.5 bg-slate-700 dark:bg-slate-300 rounded transition-all duration-200" />
          <span className="w-6 h-0.5 bg-slate-700 dark:bg-slate-300 rounded transition-all duration-200" />
        </button>
        <h1 className="m-0 text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 truncate">
          {pageTitle}
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
            {t('header.greeting', { name: user.username || t('common.userFallback') })}
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200"
          >
            <HiLogout className="text-base" />
            <span className="hidden sm:inline">{t('header.logoutButton')}</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
