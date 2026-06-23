import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { useTranslation } from 'react-i18next';

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmButtonVariant = 'primary',
  cancelButtonVariant = 'secondary',
}) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
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

    const focusableElementsString =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
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
        focusableElements = Array.from(
          dialogRef.current.querySelectorAll(focusableElementsString)
        );
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
          className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialogTitle"
          aria-describedby="dialogMessage"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={dialogRef}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md flex flex-col gap-4 shadow-xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          >
            <h3
              id="dialogTitle"
              className="text-lg font-semibold text-slate-800 dark:text-slate-100 text-center m-0"
            >
              {title || t('confirmationDialog.defaultTitle')}
            </h3>
            <p
              id="dialogMessage"
              className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed m-0"
            >
              {message || t('confirmationDialog.defaultMessage')}
            </p>
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
