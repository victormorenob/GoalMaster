// frontend/app/src/components/charts/GoalProgressChart.js
import React from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

/**
 * Displays a circular progress chart with entrance animation.
 * @param {number} progressPercentage - El valor del progreso (0-100).
 */
function GoalProgressChart({ progressPercentage }) {
    const percentage = Math.round(progressPercentage || 0);

    return (
        <motion.div
            className="w-[150px] h-[150px] mx-auto my-4"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, duration: 0.6 }}
        >
            <style>{`
                .themed-circular-progressbar .CircularProgressbar-path {
                    stroke: var(--success);
                    transition: stroke-dashoffset 0.5s ease 0s;
                }
                .themed-circular-progressbar .CircularProgressbar-trail {
                    stroke: var(--muted);
                }
                .themed-circular-progressbar .CircularProgressbar-text {
                    fill: var(--success);
                    font-size: 20px;
                    font-weight: 600;
                }
            `}</style>
            <CircularProgressbar
                value={percentage}
                text={`${percentage}%`}
                className="themed-circular-progressbar"
                strokeWidth={8}
            />
        </motion.div>
    );
}

export default GoalProgressChart;
