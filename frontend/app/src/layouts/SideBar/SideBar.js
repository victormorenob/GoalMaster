// frontend/app/src/layouts/SideBar/SideBar.js
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './SideBar.module.css';
import { FaPlus, FaHome, FaBullseye, FaChartBar, FaUser, FaCog, FaTrophy } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import LevelBadge from '../../components/gamification/LevelBadge';
import api from '../../services/apiService';

const Sidebar = ({ isSidebarOpen }) => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [profileStats, streakRes] = await Promise.allSettled([
                    api.getUserProfileStats(),
                    api.getStreak(),
                ]);
                const profileData = profileStats.status === 'fulfilled' ? profileStats.value?.data : null;
                const streakData = streakRes.status === 'fulfilled' ? streakRes.value?.data?.streak : null;

                setStats({
                    completedObjectives: profileData?.completed || 0,
                    streakCount: streakData?.streakCount || 0,
                    achievementsCount: 0, // Will be calculated on profile page
                });
            } catch {
                // Non-critical
            }
        };
        fetchStats();
    }, []);

    const navItems = [
        { to: "/dashboard", icon: <FaHome className={styles.icon} />, label: t('sidebar.dashboard') },
        { to: "/mis-objetivos", icon: <FaBullseye className={styles.icon} />, label: t('sidebar.myObjectives') },
        { to: "/analisis", icon: <FaChartBar className={styles.icon} />, label: t('sidebar.analysis') },
        { to: "/profile", icon: <FaUser className={styles.icon} />, label: t('sidebar.myProfile') },
        { to: "/logros", icon: <FaTrophy className={styles.icon} />, label: t('sidebar.achievements', 'Logros') },
        { to: "/settings", icon: <FaCog className={styles.icon} />, label: t('sidebar.settings') },
    ];

    return (
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarVisible : ''}`}>
            <div className={styles.logoContainer}>
                <div className={styles.appLogoCircle}>
                    <span>G</span>
                </div>
                <span className={styles.appName}>GoalMaster</span>
            </div>

            {stats && <LevelBadge stats={stats} compact />}

            <NavLink to="/objectives/new" className={`${styles.createButton} btn-shine`}>
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