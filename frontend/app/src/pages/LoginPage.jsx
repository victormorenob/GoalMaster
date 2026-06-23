import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          {t('loginPage.title')}
        </h1>
        <LoginForm />
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">
          {t('loginPage.prompt')}{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium">
            {t('loginPage.registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
