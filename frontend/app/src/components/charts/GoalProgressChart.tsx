// frontend/app/src/components/charts/GoalProgressChart.js
// @ts-nocheck
import React from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from './GoalProgressChart.module.css'; // Importamos nuestro CSS Module

/**
 * Displays a circular progress chart.
 * @param {number} progressPercentage - El valor del progreso (0-100).
 */
function GoalProgressChart({ progressPercentage }) {
    const percentage = Math.round(progressPercentage || 0);

    return (
        <div className={styles.chartContainer}>
            <CircularProgressbar
                value={percentage}
                text={`${percentage}%`}
                // Styles are now controlled via CSS to adapt to the theme
                className={styles.themedCircularProgressbar}
                strokeWidth={8}
            />
        </div>
    );
}

export default GoalProgressChart;