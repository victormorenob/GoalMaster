// frontend/app/src/components/charts/GoalProgressChart.js
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

/**
 * Displays a circular progress chart.
 * @param {number} progressPercentage - El valor del progreso (0-100).
 */
function GoalProgressChart({ progressPercentage }) {
    const percentage = Math.round(progressPercentage || 0);

    return (
        <div className="w-[150px] h-[150px] mx-auto my-4">
            <CircularProgressbar
                value={percentage}
                text={`${percentage}%`}
                styles={buildStyles({
                    pathColor: 'var(--success)',
                    trailColor: 'var(--muted)',
                    textColor: 'var(--success)',
                    textSize: '20px',
                    pathTransitionDuration: 0.5,
                })}
                strokeWidth={8}
            />
        </div>
    );
}

export default GoalProgressChart;