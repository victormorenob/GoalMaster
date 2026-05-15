import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Generic component to group a label, input, and error message
function FormGroup({
    label,
    htmlFor,
    required,
    error,
    children
}) {
    return (
        <div className="mb-2 flex flex-col gap-[0.3rem]">
            <label htmlFor={htmlFor} className="block mb-0 text-base font-semibold text-[var(--foreground)]">
                {label}
                {required && <span className="text-[var(--destructive)] ml-1">*</span>}
            </label>
            {children}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.p
                        className="text-[var(--destructive)] text-sm mt-1 mb-0"
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

export default FormGroup;
