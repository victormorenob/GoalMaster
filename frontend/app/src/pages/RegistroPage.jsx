import React from 'react';
import RegistrationForm from '../components/auth/RegistroForm';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function RegistrationPage() {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          {t('registroPage.title')}
        </h1>
        <RegistrationForm />
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-4">
          {t('registroPage.prompt')}{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium">
            {t('registroPage.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegistrationPage;
