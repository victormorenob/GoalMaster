// frontend/app/src/layouts/SideBar/SideBar.js
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaHome, FaBullseye, FaChartBar, FaUser, FaCog, FaTrophy } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import LevelBadge from '../../components/gamification/LevelBadge';
import api from '../../services/apiService';

const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' } }),
};

const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

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
                    achievementsCount: 0,
                });
            } catch {
                // Non-critical
            }
        };
        fetchStats();
    }, []);

    const navItems = [
        { to: "/dashboard", icon: <FaHome className="text-xl" />, label: t('sidebar.dashboard') },
        { to: "/mis-objetivos", icon: <FaBullseye className="text-xl" />, label: t('sidebar.myObjectives') },
        { to: "/analisis", icon: <FaChartBar className="text-xl" />, label: t('sidebar.analysis') },
        { to: "/profile", icon: <FaUser className="text-xl" />, label: t('sidebar.myProfile') },
        { to: "/logros", icon: <FaTrophy className="text-xl" />, label: t('sidebar.achievements', 'Logros') },
        { to: "/settings", icon: <FaCog className="text-xl" />, label: t('sidebar.settings') },
    ];

    const sidebarContent = (
        <aside className="w-[250px] min-w-[250px] bg-[var(--sidebar-background)] text-[var(--sidebar-foreground)] p-6 flex flex-col h-screen overflow-y-auto flex-shrink-0 fixed top-0 left-0 z-[1000] shadow-[4px_0_15px_rgba(0,0,0,0.1)] md:sticky md:translate-x-0 md:z-20 md:shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
            <motion.div
                className="flex items-center gap-3 mb-8 pl-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex justify-center items-center text-[var(--primary-foreground)] font-bold text-2xl">
                    <span>G</span>
                </div>
                <span className="text-[1.7rem] font-bold text-[var(--sidebar-foreground)]">GoalMaster</span>
            </motion.div>

            {stats && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <LevelBadge stats={stats} compact />
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
            >
                <NavLink to="/objectives/new" className="flex items-center justify-center gap-[0.6rem] px-4 py-[0.8rem] bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-lg border-none rounded-[var(--radius)] cursor-pointer transition-colors duration-200 ease-in-out mb-10 shadow-[0_2px_5px_rgba(0,0,0,0.1)] text-center no-underline hover:bg-[var(--primary-hover)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] btn-shine">
                    <FaPlus className="text-xl" /> {t('sidebar.newObjective')}
                </NavLink>
            </motion.div>

            <nav className="flex flex-col gap-2">
                {navItems.map((item, i) => (
                    <motion.div
                        key={item.to}
                        custom={i}
                        variants={navItemVariants}
                        initial="hidden"
                        animate="show"
                    >
                        <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 text-[var(--sidebar-foreground)] text-base font-medium no-underline rounded-[var(--radius)] transition-colors duration-200 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] ${isActive ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold no-underline' : ''}`
                            }
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    </motion.div>
                ))}
            </nav>
        </aside>
    );

    return (
        <AnimatePresence mode="wait">
            {/* Mobile: animated sidebar */}
            <motion.div
                key="sidebar-mobile"
                className="block md:hidden"
                variants={sidebarVariants}
                initial="closed"
                animate={isSidebarOpen ? 'open' : 'closed'}
                exit="closed"
            >
                {sidebarContent}
            </motion.div>
            {/* Desktop: always visible */}
            <div key="sidebar-desktop" className="hidden md:block">
                {sidebarContent}
            </div>
        </AnimatePresence>
    );
};

export default Sidebar;
