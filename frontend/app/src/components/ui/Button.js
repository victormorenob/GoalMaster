// frontend/app/src/components/ui/Button.js
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const variantClasses = {
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]',
    secondary: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[color-mix(in_srgb,var(--destructive)_80%,black)]',
    destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[color-mix(in_srgb,var(--destructive)_85%,black)]',
    outline: 'bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:border-[var(--border-hover)] hover:text-[var(--primary)]',
    ghost: 'bg-none border-none p-0 text-[var(--primary)] underline cursor-pointer m-0 hover:no-underline hover:text-[var(--primary-hover)]',
    buttonOutline: 'inline-flex items-center justify-center gap-[0.3rem] px-3 py-[0.4rem] bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-[var(--radius)] cursor-pointer transition-all duration-200 hover:bg-[var(--muted)] hover:border-[var(--border-hover)] hover:text-[var(--primary)] disabled:opacity-60 disabled:cursor-not-allowed',
    buttonSecondary: 'inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--destructive)] text-[var(--destructive-foreground)] font-medium text-base border-none rounded-[var(--radius)] cursor-pointer transition-colors duration-200 text-center mt-0 hover:bg-[color-mix(in_srgb,var(--destructive)_80%,black)] focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_50%,transparent)] disabled:opacity-60 disabled:cursor-not-allowed',
    buttonLink: 'bg-none border-none p-0 text-[var(--primary)] text-base cursor-pointer underline m-0 transition-[text-decoration] duration-200 hover:no-underline hover:text-[var(--primary-hover)]',
    buttonSubtle: 'bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] mt-0 hover:bg-[var(--border)] hover:border-[var(--border-hover)] focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--foreground)_20%,transparent)]',
    buttonCreateObjective: 'inline-flex bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg rounded-[var(--radius)] transition-colors duration-200 w-auto justify-center items-center gap-[0.4rem] mt-0 hover:bg-[var(--primary-hover)] focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_50%,transparent)]',
    small: 'px-3 py-[0.3rem] text-xs',
    medium: 'px-4 py-2 text-lg',
    icon: 'p-2',
};

const baseButtonClasses = 'inline-flex items-center justify-center font-semibold border-none rounded-[var(--radius)] cursor-pointer transition-colors duration-200 text-center gap-2';

const MotionButton = motion.create('button');

const Button = ({
    children,
    className = '',
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    disabled = false,
    type = 'button',
    onClick,
    leftIcon,
    rightIcon,
    ...rest
}) => {
    const { t } = useTranslation();

    const buttonVariant = variantClasses[variant] || variantClasses.primary;
    const buttonSize = variantClasses[size] || variantClasses.medium;
    const buttonClass = `${baseButtonClasses} ${buttonVariant} ${buttonSize} ${isLoading ? 'opacity-60' : ''} ${className}`.trim();

    return (
        <MotionButton
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled || isLoading}
            whileHover={!disabled && !isLoading ? { scale: 1.03 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            {...rest}
        >
            {isLoading ? (
                <span>{t('loaders.loadingSimple')}</span>
            ) : (
                <>
                    {leftIcon && <span>{leftIcon}</span>}
                    {children}
                    {rightIcon && <span>{rightIcon}</span>}
                </>
            )}
        </MotionButton>
    );
};

export default Button;
