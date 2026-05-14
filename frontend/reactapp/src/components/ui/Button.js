// frontend/reactapp/src/components/ui/Button.js
import React from 'react';
import styles from './Button.module.css'; // Make sure the path is correct
import { useTranslation } from 'react-i18next';
// Optional: import LoadingSpinner from './LoadingSpinner'; // If you want a spinner inside the button

const Button = ({
    children,
    className = '',    // External class
    variant = 'primary', // Visual style prop (e.g. 'primary', 'secondary', 'ghost')
    size = 'medium',     // Prop for button size (e.g. 'small', 'medium', 'large')
    type = 'button',     // Prop for HTML button type
    ...rest              // Collect any other standard HTML button props (e.g. aria-label, id)
}) => {
    const { t } = useTranslation();

    // Build CSS classes dynamically
    const buttonClass = [
        styles.button,
        styles[`${variant}Variant`],
        styles[size] || styles.medium,      // Size class (with fallback)
        isLoading ? styles.loading : '',    // Optional class when loading
        className,
    ].filter(Boolean).join(' ').trim();     // filter(Boolean) removes empty classes, trim removes spaces

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || isLoading} // Button is disabled if its 'disabled' prop is true or if 'isLoading' is true
            {...rest}
        >
            {isLoading ? (
                <>
                    <span className={styles.loadingText}>{t('loaders.loadingSimple')}</span>
                </>
            ) : (
                <>
                    {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;