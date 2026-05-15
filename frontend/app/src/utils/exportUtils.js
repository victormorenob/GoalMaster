// frontend/app/src/utils/exportUtils.js
import { jsPDF } from 'jspdf';

/**
 * Converts an array of objectives to CSV and triggers download.
 * @param {Array} objectives - Array of objective objects.
 * @param {string} [filename] - Optional filename.
 */
export const exportToCSV = (objectives, filename = 'goalmaster_objectives.csv') => {
    if (!objectives || objectives.length === 0) return;

    // Define CSV headers
    const headers = [
        'ID', 'Name', 'Description', 'Category', 'Status',
        'Initial Value', 'Current Value', 'Target Value', 'Unit',
        'Start Date', 'End Date', 'Progress %', 'Tags',
        'Created At', 'Updated At'
    ];

    // Map objectives to CSV rows
    const rows = objectives.map(obj => [
        obj.id,
        escapeCsvField(obj.name),
        escapeCsvField(obj.description || ''),
        obj.category,
        obj.status,
        obj.initialValue ?? '',
        obj.currentValue ?? '',
        obj.targetValue ?? '',
        obj.unit || '',
        obj.startDate || '',
        obj.endDate || '',
        obj.progressPercentage ?? '',
        Array.isArray(obj.tags) ? obj.tags.join('; ') : (obj.tags || ''),
        obj.createdAt || '',
        obj.updatedAt || '',
    ]);

    // Build CSV content
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    // Trigger download
    downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Exports data as JSON file download.
 * @param {*} data - The data to export.
 * @param {string} [filename] - Optional filename.
 */
export const exportToJSON = (data, filename = 'goalmaster_data.json') => {
    const jsonString = JSON.stringify(data, null, 2);
    downloadBlob(jsonString, filename, 'application/json');
};

/**
 * Generates a PDF report for a single objective.
 * @param {object} objective - The objective to export.
 * @param {string} [lang] - Language for labels ('es' or 'en').
 */
export const exportToPDF = (objective, lang = 'es') => {
    const doc = new jsPDF();
    const labels = lang === 'es' ? {
        title: 'Reporte de Objetivo',
        name: 'Nombre',
        description: 'Descripción',
        category: 'Categoría',
        status: 'Estado',
        progress: 'Progreso',
        startDate: 'Fecha de Inicio',
        endDate: 'Fecha de Fin',
        currentValue: 'Valor Actual',
        targetValue: 'Valor Meta',
        unit: 'Unidad',
        created: 'Creado',
        noDescription: 'Sin descripción',
    } : {
        title: 'Goal Report',
        name: 'Name',
        description: 'Description',
        category: 'Category',
        status: 'Status',
        progress: 'Progress',
        startDate: 'Start Date',
        endDate: 'End Date',
        currentValue: 'Current Value',
        targetValue: 'Target Value',
        unit: 'Unit',
        created: 'Created',
        noDescription: 'No description',
    };

    // Title
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text(labels.title, 105, 20, { align: 'center' });

    // Separator line
    doc.setDrawColor(41, 128, 185);
    doc.line(14, 25, 196, 25);

    // Objective details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let y = 35;
    const lineHeight = 8;

    // Name
    doc.setFont('helvetica', 'bold');
    doc.text(`${labels.name}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(objective.name || '', 50, y);
    y += lineHeight;

    // Description
    doc.setFont('helvetica', 'bold');
    doc.text(`${labels.description}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    const desc = objective.description || labels.noDescription;
    const splitDesc = doc.splitTextToSize(desc, 140);
    doc.text(splitDesc, 50, y);
    y += lineHeight * Math.max(1, splitDesc.length);

    // Category
    doc.setFont('helvetica', 'bold');
    doc.text(`${labels.category}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(objective.category || '', 50, y);
    y += lineHeight;

    // Status
    doc.setFont('helvetica', 'bold');
    doc.text(`${labels.status}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(objective.status || '', 50, y);
    y += lineHeight;

    // Progress bar
    doc.setFont('helvetica', 'bold');
    doc.text(`${labels.progress}:`, 14, y);
    const progress = objective.progressPercentage ?? 0;
    doc.setFont('helvetica', 'normal');
    doc.text(`${progress}%`, 50, y);

    // Draw progress bar
    doc.setDrawColor(200, 200, 200);
    doc.rect(70, y - 4, 80, 6);
    doc.setFillColor(41, 128, 185);
    doc.rect(70, y - 4, (progress / 100) * 80, 6, 'F');
    y += lineHeight + 4;

    // Dates
    if (objective.startDate) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${labels.startDate}:`, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(objective.startDate, 50, y);
        y += lineHeight;
    }
    if (objective.endDate) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${labels.endDate}:`, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(objective.endDate, 50, y);
        y += lineHeight;
    }

    // Quantitative values
    if (objective.targetValue != null) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${labels.currentValue}:`, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${objective.currentValue ?? objective.initialValue ?? 0} ${objective.unit || ''}`, 50, y);
        y += lineHeight;

        doc.setFont('helvetica', 'bold');
        doc.text(`${labels.targetValue}:`, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${objective.targetValue} ${objective.unit || ''}`, 50, y);
        y += lineHeight;
    }

    // Created date
    if (objective.createdAt) {
        y += lineHeight;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`${labels.created}: ${new Date(objective.createdAt).toLocaleDateString()}`, 14, y);
    }

    // Save the PDF
    const safeName = objective.name ? objective.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) : 'objective';
    doc.save(`${safeName}_report.pdf`);
};

/**
 * Escape a field for CSV (wrap in quotes if contains comma, quote, or newline).
 * @param {string} value
 * @returns {string}
 */
function escapeCsvField(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Trigger a file download using a Blob URL.
 * @param {string} content - File content.
 * @param {string} filename - Download filename.
 * @param {string} mimeType - MIME type.
 */
function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
