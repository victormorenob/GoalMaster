import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const inputBaseClasses = 'block w-full px-3 py-[0.6rem] border border-[var(--border)] rounded-[var(--radius-sm,0.375rem)] text-sm leading-5 text-[var(--foreground)] bg-[var(--background)] bg-clip-padding transition-all duration-200 box-border';
const inputFocusClasses = 'focus:outline-none focus:border-[var(--ring)] focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--ring)_25%,transparent)]';
const inputDisabledClasses = 'disabled:bg-[var(--muted)] disabled:opacity-70 disabled:cursor-not-allowed disabled:text-[var(--muted-foreground)] disabled:border-[var(--border)]';
const inputErrorClasses = '!border-[var(--destructive)] focus:!border-[var(--destructive)] focus:!shadow-[0_0_0_0.2rem_color-mix(in_srgb,var(--destructive)_25%,transparent)]';

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

    const errorClass = isError ? inputErrorClasses : '';
    const elementType = type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input';
    const specificInputType = type;

    const textareaClasses = `${inputBaseClasses} ${inputFocusClasses} ${inputDisabledClasses} min-h-[100px] resize-y leading-relaxed ${errorClass} ${className || ''}`.trim();
    const selectClasses = `${inputBaseClasses} ${inputFocusClasses} ${inputDisabledClasses} ${inputBaseClasses} min-h-[calc(0.95rem*1.5+0.6rem*2+2px)] ${errorClass} ${className || ''}`.trim();
    const inputClasses = `${inputBaseClasses} ${inputFocusClasses} ${inputDisabledClasses} min-h-[calc(0.95rem*1.5+0.6rem*2+2px)] ${errorClass} ${className || ''}`.trim();
    const wrapperClasses = `relative flex items-center ${wrapperClassName || ''}`.trim();

    const inputElement = () => {
        if (elementType === 'textarea') {
            return (
                <textarea
                    id={id}
                    className={textareaClasses}
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

        if (elementType === 'select') {
            return (
                <select
                    id={id}
                    className={selectClasses}
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
            <motion.input
                type={specificInputType}
                id={id}
                className={inputClasses}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                ref={ref}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                {...rest}
            />
        );
    };

    return (
        <div className={wrapperClasses}>
            {inputElement()}
            {actionIcon && onActionClick && (
                <button
                    type="button"
                    onClick={onActionClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none p-[0.35rem] cursor-pointer text-[var(--muted-foreground)] flex items-center justify-center text-lg leading-none hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
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
