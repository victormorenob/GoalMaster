import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegistroPage';
import DashboardPage from './pages/DashboardPage';
import CreateGoalPage from './pages/CreateGoalPage';
import MyObjectivesPage from './pages/MyObjectivesPage';
import EditGoalPage from './pages/EditGoalPage';
import GoalDetailPage from './pages/GoalDetailPage';
import UpdateProgressPage from './pages/UpdateProgressPage';
import AnalysisPage from './pages/AnalysisPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AchievementsPage from './pages/AchievementsPage';
import TagsPage from './pages/TagsPage';
import AssistantPage from './pages/AssistantPage';

import AppHeader from './layouts/AppHeader';
import Sidebar from './layouts/SideBar/SideBar';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FullPageLoader from './components/ui/FullPageLoader';
import { pageTransition, getReducedMotion } from './utils/motion';
import { ROUTE_PATHS } from './utils/routePaths';

function AnimatedOutlet() {
    const location = useLocation();
    const reduced = getReducedMotion();

    if (reduced) {
        return (
            <Routes location={location}>
                <Route path={ROUTE_PATHS.DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTE_PATHS.MY_OBJECTIVES} element={<MyObjectivesPage />} />
                <Route path={ROUTE_PATHS.NEW_OBJECTIVE} element={<CreateGoalPage />} />
                <Route path={ROUTE_PATHS.EDIT_OBJECTIVE} element={<EditGoalPage />} />
                <Route path={ROUTE_PATHS.UPDATE_PROGRESS} element={<UpdateProgressPage />} />
                <Route path={ROUTE_PATHS.VIEW_OBJECTIVE} element={<GoalDetailPage />} />
                <Route path={ROUTE_PATHS.ANALYSIS} element={<AnalysisPage />} />
                <Route path={ROUTE_PATHS.ACHIEVEMENTS} element={<AchievementsPage />} />
                <Route path={ROUTE_PATHS.TAGS} element={<TagsPage />} />
                <Route path={ROUTE_PATHS.ASSISTANT} element={<AssistantPage />} />
                <Route path={ROUTE_PATHS.PROFILE} element={<ProfilePage />} />
                <Route path={ROUTE_PATHS.SETTINGS} element={<SettingsPage />} />
                <Route path="*" element={<Navigate to={ROUTE_PATHS.DASHBOARD} replace />} />
            </Routes>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div key={location.pathname} {...pageTransition} style={{ width: '100%' }}>
                <Routes location={location}>
                    <Route path={ROUTE_PATHS.DASHBOARD} element={<DashboardPage />} />
                    <Route path={ROUTE_PATHS.MY_OBJECTIVES} element={<MyObjectivesPage />} />
                    <Route path={ROUTE_PATHS.NEW_OBJECTIVE} element={<CreateGoalPage />} />
                    <Route path={ROUTE_PATHS.EDIT_OBJECTIVE} element={<EditGoalPage />} />
                    <Route path={ROUTE_PATHS.UPDATE_PROGRESS} element={<UpdateProgressPage />} />
                    <Route path={ROUTE_PATHS.VIEW_OBJECTIVE} element={<GoalDetailPage />} />
                    <Route path={ROUTE_PATHS.ANALYSIS} element={<AnalysisPage />} />
                    <Route path={ROUTE_PATHS.ACHIEVEMENTS} element={<AchievementsPage />} />
                    <Route path={ROUTE_PATHS.TAGS} element={<TagsPage />} />
                    <Route path={ROUTE_PATHS.ASSISTANT} element={<AssistantPage />} />
                    <Route path={ROUTE_PATHS.PROFILE} element={<ProfilePage />} />
                    <Route path={ROUTE_PATHS.SETTINGS} element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to={ROUTE_PATHS.DASHBOARD} replace />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

function AppShell() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="App">
            <Sidebar isSidebarOpen={isSidebarOpen} />
            <div className="main-layout-content">
                <AppHeader onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="main-content-area">
                    <AnimatedOutlet />
                </main>
            </div>
            {isSidebarOpen && (
                <button
                    className="sidebarOverlay"
                    onClick={() => setSidebarOpen(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setSidebarOpen(false)}
                    aria-label="Close sidebar"
                />
            )}
        </div>
    );
}

function AppContent() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { isLoadingSettings } = useSettings();
    const { t } = useTranslation();

    if (isAuthLoading || (isAuthenticated && isLoadingSettings)) {
        return <FullPageLoader message={t('loaders.initializing')} />;
    }

    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
                <Route path={ROUTE_PATHS.REGISTER} element={<RegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route path="/*" element={<AppShell />} />
            </Route>
            <Route path="*" element={<Navigate to={isAuthenticated ? ROUTE_PATHS.DASHBOARD : ROUTE_PATHS.LOGIN} replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
                <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
                <Tooltip className="custom-tooltip" id="info-tooltip" />
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;
