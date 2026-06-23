// frontend/app/src/utils/chartUtils.js
// @ts-nocheck

/**
 * Returns default options for Doughnut charts.
 * @param {function} t - The i18next translation function.
 */
export const getDefaultDonutOptions = (t) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15, font: { size: 11 } },
        },
        title: { display: false },
        tooltip: {
            callbacks: {
                label: (context) => {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.chart.getDatasetMeta(0).total;
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${label}: ${value} (${percentage}%)`;
                }
            }
        }
    },
    cutout: '60%',
});

/**
 * Returns default options for horizontal bar charts.
 * @param {function} t - The i18next translation function.
 * @param {string} xAxisLabel - La etiqueta para el eje X (horizontal).
 * @returns {object} Objeto de opciones para Chart.js.
 */
export const getDefaultHorizontalBarOptions = (t, xAxisLabel = 'Progress') => ({
    indexAxis: 'y', // <-- Esto hace que las barras sean horizontales
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: xAxisLabel },
            ticks: { callback: (value) => value + '%' }
        },
        y: {
            ticks: { autoSkip: false }
        }
    },
    plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
            callbacks: {
                label: (context) => `${context.dataset.label || ''}: ${context.parsed.x ? context.parsed.x.toFixed(1) : 0}%`
            }
        }
    },
});