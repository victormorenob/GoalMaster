import React from 'react';

function FormGroup({
  label,
  htmlFor,
  required,
  error,
  children,
}) {
  return (
    <div className="mb-2 flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-0.5 m-0">{error}</p>
      )}
    </div>
  );
}

export default FormGroup;
