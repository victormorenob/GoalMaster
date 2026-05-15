import React from 'react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
    return (
        <div className="grid grid-rows-[auto_1fr] p-0 box-border min-h-screen">
            <motion.main
                className="flex flex-col justify-center items-center flex-grow overflow-y-auto py-6 px-[0.8rem] bg-[var(--background)] relative transition-colors duration-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                    <Outlet />
                </motion.div>
            </motion.main>
        </div>
    );
}

export default AuthLayout;
