import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const FullPageLoader = ({ message }) => {
    return (
        <motion.div
            className="fixed inset-0 w-full h-full bg-[var(--background)]/85 flex justify-center items-center z-[99999] backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="text-center px-10 py-[30px] bg-[var(--card)] rounded-[var(--radius-md,10px)] shadow-[var(--shadow-lg,0_4px_20px_rgba(0,0,0,0.15))] border border-[var(--border)]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <LoadingSpinner size="large" text="" />
                {message && <p className="mt-5 text-[1.15em] text-[var(--card-foreground)] font-medium">{message}</p>}
            </motion.div>
        </motion.div>
    );
};

export default FullPageLoader;
