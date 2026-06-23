// frontend/app/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

// Page imports
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

// Layout and UI component imports
import AppHeader from './layouts/AppHeader';
import Sidebar from './layouts/SideBar/SideBar';
import FullPageLoader from './components/ui/FullPageLoader';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15, ease: 'easeIn' } },
};

// The main component that contains routing and layout logic
function AppContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLoadingSettings } = useSettings();
  const location = useLocation();
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (isAuthLoading || (isAuthenticated && isLoadingSettings)) {
    return <FullPageLoader message={t('loaders.initializing')} />;
  }

  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <AppHeader onMenuClick={() => setSidebarOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Routes location={location}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/mis-objetivos" element={<MyObjectivesPage />} />
                  <Route path="/objectives/new" element={<CreateGoalPage />} />
                  <Route path="/objectives/edit/:id" element={<EditGoalPage />} />
                  <Route path="/objectives/:id/update-progress" element={<UpdateProgressPage />} />
                  <Route path="/objectives/:id" element={<GoalDetailPage />} />
                  <Route path="/analisis" element={<AnalysisPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Tooltip className="custom-tooltip" id="info-tooltip" />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
