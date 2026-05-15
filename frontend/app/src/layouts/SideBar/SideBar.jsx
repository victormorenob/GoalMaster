// frontend/app/src/layouts/SideBar/SideBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineFlag,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineCog,
  HiPlus,
} from 'react-icons/hi';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/dashboard', icon: HiOutlineHome, labelKey: 'sidebar.dashboard' },
  { to: '/mis-objetivos', icon: HiOutlineFlag, labelKey: 'sidebar.myObjectives' },
  { to: '/analisis', icon: HiOutlineChartBar, labelKey: 'sidebar.analysis' },
  { to: '/profile', icon: HiOutlineUser, labelKey: 'sidebar.myProfile' },
  { to: '/settings', icon: HiOutlineCog, labelKey: 'sidebar.settings' },
];

const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

const overlayVariants = {
  open: { opacity: 1, transition: { duration: 0.2 } },
  closed: { opacity: 0, transition: { duration: 0.2 } },
};

const Sidebar = ({ isSidebarOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-30
          w-64 h-screen
          bg-slate-900 dark:bg-slate-950
          text-slate-100
          flex flex-col
          shadow-xl md:shadow-md
          overflow-y-auto
          md:translate-x-0
        `}
        variants={sidebarVariants}
        initial={false}
        animate={isSidebarOpen ? 'open' : 'closed'}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
            G
          </div>
          <span className="text-xl font-bold text-white">GoalMaster</span>
        </div>

        {/* Create Objective button */}
        <NavLink
          to="/objectives/new"
          className={({ isActive }) =>
            `mx-4 mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm
            bg-indigo-600 text-white hover:bg-indigo-500
            transition-colors duration-200
            ${isActive ? 'ring-2 ring-indigo-400' : ''}`
          }
        >
          <HiPlus className="text-lg" />
          <span>{t('sidebar.newObjective')}</span>
        </NavLink>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="text-xl shrink-0" />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
};

export default Sidebar;
