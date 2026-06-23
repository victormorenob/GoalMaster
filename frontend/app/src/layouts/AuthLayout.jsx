import React from 'react';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
      <main className="w-full max-w-md">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
