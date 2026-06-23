// frontend/app/src/layouts/SideBar/SideBar.js
// @ts-nocheck
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './SideBar.module.css';
import { FaPlus, FaHome, FaBullseye, FaChartBar, FaUser, FaCog, FaTrophy, FaTags, FaRobot } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../utils/routePaths';

const Sidebar = ({ isSidebarOpen }) => {
    const { t } = useTranslation();

    const navItems = [
        { to: ROUTE_PATHS.DASHBOARD, icon: <FaHome className={styles.icon} />, label: t('sidebar.dashboard') },
        { to: ROUTE_PATHS.MY_OBJECTIVES, icon: <FaBullseye className={styles.icon} />, label: t('sidebar.myObjectives') },
        { to: ROUTE_PATHS.ANALYSIS, icon: <FaChartBar className={styles.icon} />, label: t('sidebar.analysis') },
        { to: ROUTE_PATHS.ACHIEVEMENTS, icon: <FaTrophy className={styles.icon} />, label: t('sidebar.achievements', { defaultValue: 'Logros' }) },
        { to: ROUTE_PATHS.TAGS, icon: <FaTags className={styles.icon} />, label: t('sidebar.tags', { defaultValue: 'Etiquetas' }) },
        { to: ROUTE_PATHS.ASSISTANT, icon: <FaRobot className={styles.icon} />, label: t('sidebar.assistant', { defaultValue: 'Asistente' }) },
        { to: ROUTE_PATHS.PROFILE, icon: <FaUser className={styles.icon} />, label: t('sidebar.myProfile') },
        { to: ROUTE_PATHS.SETTINGS, icon: <FaCog className={styles.icon} />, label: t('sidebar.settings') },
    ];

    return (
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarVisible : ''}`}>
            <div className={styles.logoContainer}>
                <div className={styles.appLogoCircle}>
                    <span>G</span>
                </div>
                <span className={styles.appName}>GoalMaster</span>
            </div>

            <NavLink to={ROUTE_PATHS.NEW_OBJECTIVE} className={`${styles.createButton} btn-shine`}>
                <FaPlus className={styles.icon} /> {t('sidebar.newObjective')}
            </NavLink>

            <nav className={styles.navigation}>
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.activeNavItem : ''}`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;