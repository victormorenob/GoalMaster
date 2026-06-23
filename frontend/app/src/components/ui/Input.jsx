import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

const inputBaseClass =
  'block w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 ' +
  'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ' +
  'placeholder-slate-400 dark:placeholder-slate-500 ' +
  'transition-colors duration-200 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 ' +
  'disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:opacity-70 disabled:cursor-not-allowed';

const errorClass =
  'border-red-500 dark:border-red-400 focus:ring-red-400 focus:border-red-400';

const Input = forwardRef(({
  type = 'text',
  id,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled,
  isError,
  children,
  className,
  wrapperClassName = '',
  actionIcon,
  onActionClick,
  actionIconAriaLabel,
  ...rest
}, ref) => {
  const { t } = useTranslation();

  const finalInputClassName = `${inputBaseClass} ${isError ? errorClass : ''} ${className || ''}`.trim();
  const finalWrapperClassName = `relative flex items-center ${wrapperClassName || ''}`.trim();

  const inputElement = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={id}
          className={`${finalInputClassName} min-h-[100px] resize-y leading-relaxed`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          ref={ref}
          {...rest}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={id}
          className={finalInputClassName}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          ref={ref}
          {...rest}
        >
          {children}
        </select>
      );
    }

    return (
      <input
        type={type}
        id={id}
        className={finalInputClassName}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        ref={ref}
        {...rest}
      />
    );
  };

  return (
    <div className={finalWrapperClassName}>
      {inputElement()}
      {actionIcon && onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none p-1.5 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center text-base"
          aria-label={actionIconAriaLabel || t('input.defaultActionAriaLabel')}
          disabled={disabled}
        >
          {actionIcon}
        </button>
      )}
    </div>
  );
});

export default Input;
