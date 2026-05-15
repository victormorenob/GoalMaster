import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { useTranslation } from 'react-i18next';

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

const dialogVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

/**
 * An accessible modal dialog for confirming user actions.
 * @param {boolean} isOpen - Controls dialog visibility.
 * @param {function} onClose - Function to call to close the dialog.
 * @param {function} onConfirm - Function to call when the user confirms.
 * @param {string} title - The dialog title.
 * @param {string} message - The dialog message or question.
 */

function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    confirmButtonVariant = "primary",
    cancelButtonVariant = "secondary"
}) {
    const { t } = useTranslation();
    const dialogRef = useRef(null);
    const confirmButtonRef = useRef(null);
    const previouslyFocusedElementRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previouslyFocusedElementRef.current = document.activeElement;
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        let focusableElements = [];
        let firstFocusableElement = null;
        let lastFocusableElement = null;

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            if (dialogRef.current) {
                const firstButtonInDialog = dialogRef.current.querySelector('button');
                if (firstButtonInDialog) {
                    firstButtonInDialog.focus();
                } else {
                    dialogRef.current.setAttribute('tabindex', '-1');
                    dialogRef.current.focus();
                }
                focusableElements = Array.from(dialogRef.current.querySelectorAll(focusableElementsString));
                if (focusableElements.length > 0) {
                    firstFocusableElement = focusableElements[0];
                    lastFocusableElement = focusableElements[focusableElements.length - 1];
                }
            }
        }

        const handleTabKey = (event) => {
            if (event.key === 'Tab' && isOpen && dialogRef.current) {
                if (focusableElements.length === 0) {
                    event.preventDefault();
                    return;
                }
                if (event.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        event.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        event.preventDefault();
                    }
                }
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleTabKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('keydown', handleTabKey);
            if (previouslyFocusedElementRef.current) {
                previouslyFocusedElementRef.current.focus();
            }
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1050] p-4 backdrop-blur-[2px]"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="dialogTitle"
                    aria-describedby="dialogMessage"
                >
                    <motion.div
                        ref={dialogRef}
                        className="bg-[var(--card-background,#ffffff)] text-[var(--card-foreground,#333)] rounded-[var(--radius-lg,8px)] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.2)] w-full max-w-[450px] flex flex-col gap-5 border border-[var(--border-color,#e0e0e0)]"
                        variants={dialogVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 id="dialogTitle" className="text-[1.35rem] font-semibold text-[var(--heading-color,inherit)] text-center m-0">{title || t('confirmationDialog.defaultTitle')}</h3>
                        <p id="dialogMessage" className="text-base leading-relaxed text-[var(--text-muted-color,#555)] m-0 text-center">{message || t('confirmationDialog.defaultMessage')}</p>
                        <div className="flex justify-center gap-3 mt-2">
                            <Button
                                onClick={onClose}
                                variant={cancelButtonVariant}
                            >
                                {cancelText || t('common.cancel')}
                            </Button>
                            <Button
                                onClick={onConfirm}
                                variant={confirmButtonVariant}
                                ref={confirmButtonRef}
                            >
                                {confirmText || t('common.confirm')}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ConfirmationDialog;
