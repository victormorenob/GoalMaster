// frontend/app/src/layouts/AppHeader.js
import React from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../utils/routePaths';
import usePWA from '../hooks/usePWA';
import { FaDownload } from 'react-icons/fa';

const AppHeader = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { isInstallable, install } = usePWA();

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

    const handleInstall = async () => {
        try {
            await install();
            toast.success(t('toast.appInstalled'));
        } catch {
            toast.error(t('toast.installError'));
        }
    };

    const secondaryButtonClasses = 'inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--destructive)] text-[var(--destructive-foreground)] font-medium text-base border-none rounded-[var(--radius)] cursor-pointer transition-colors duration-200 text-center mt-0 hover:bg-[color-mix(in_srgb,var(--destructive)_80%,black)] focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_50%,transparent)] disabled:opacity-60 disabled:cursor-not-allowed';

    return (
        <motion.header
            className="h-[var(--app-header-height)] bg-[var(--card)] border-b border-[var(--border)] flex justify-between items-center px-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] w-full z-10 flex-shrink-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            <div className="flex items-center gap-3 min-w-0">
                <button className="flex flex-col justify-around w-6 h-6 bg-transparent border-none cursor-pointer p-0 z-20 flex-shrink-0 md:hidden" onClick={onMenuClick} aria-label="Abrir menú">
                    <motion.span className="w-6 h-[3px] bg-[var(--foreground)] rounded-[2px] block" whileHover={{ scaleX: 1.1 }} />
                    <motion.span className="w-6 h-[3px] bg-[var(--foreground)] rounded-[2px] block" whileHover={{ scaleX: 1.1 }} />
                    <motion.span className="w-6 h-[3px] bg-[var(--foreground)] rounded-[2px] block" whileHover={{ scaleX: 1.1 }} />
                </button>
                <motion.h1
                    className="my-0 text-[var(--foreground)] text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis md:text-[1.8rem]"
                    key={pageTitle}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {pageTitle}
                </motion.h1>
            </div>
            {user && (
                <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    {isInstallable && (
                        <button
                            onClick={handleInstall}
                            className={secondaryButtonClasses}
                            aria-label={t('pwa.installApp')}
                            title={t('pwa.installApp')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                            <FaDownload />
                            {t('pwa.installApp')}
                        </button>
                    )}
                    <span className="text-sm text-[var(--muted-foreground)]">
                        {t('header.greeting', { name: user.username || t('common.userFallback') })}
                    </span>
                    <button onClick={handleLogout} className={secondaryButtonClasses}>
                        {t('header.logoutButton')}
                    </button>
                </motion.div>
            )}
        </motion.header>
    );
}

export default AppHeader;
