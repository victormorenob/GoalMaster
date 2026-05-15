import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/apiService';
import PropTypes from 'prop-types';

const CATEGORY_ICONS = {
    HEALTH: String.fromCodePoint(0x1F4AA),
    FINANCE: String.fromCodePoint(0x1F4B0),
    PERSONAL_DEV: String.fromCodePoint(0x1F4DA),
    CAREER: String.fromCodePoint(0x1F4BC),
    RELATIONSHIPS: '\u2764\uFE0F',
    OTHER: String.fromCodePoint(0x1F4CC),
};

const CATEGORY_COLORS = {
    HEALTH: 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20',
    FINANCE: 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
    PERSONAL_DEV: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
    CAREER: 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20',
    RELATIONSHIPS: 'border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/20',
    OTHER: 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20',
};

const TemplateSelector = ({ onSelectTemplate, onClose }) => {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await api.getTemplates();
                const data = (response && response.data && response.data.templates) || [];
                setTemplates(data);
            } catch (err) {
                console.error('Error fetching templates:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const categories = useMemo(() => {
        const cats = ['all', ...new Set(templates.map(t => t.category))];
        return cats;
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        if (activeCategory === 'all') return templates;
        return templates.filter(t => t.category === activeCategory);
    }, [templates, activeCategory]);

    const handleSelect = (template) => {
        const formData = {
            name: template.name,
            description: template.description || '',
            category: template.category,
            targetValue: template.targetValue != null ? Number(template.targetValue) : '',
            unit: template.unit || '',
            initialValue: template.isQuantitative ? 0 : '',
        };
        onSelectTemplate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {t('templates.selectTemplate', 'Select a Template')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
                        aria-label="Close"
                    >
                        {'\u2715'}
                    </button>
                </div>

                <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                activeCategory === cat
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {cat === 'all' ? t('common.all', 'All') : t(`categories.${cat.toLowerCase()}`, cat)}
                        </button>
                    ))}
                </div>

                <div className="p-4 overflow-y-auto max-h-[50vh]">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">{t('common.loading', 'Loading...')}</div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">{t('templates.noTemplates', 'No templates found.')}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleSelect(template)}
                                    className={`text-left p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${CATEGORY_COLORS[template.category] || CATEGORY_COLORS.OTHER}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{CATEGORY_ICONS[template.category] || String.fromCodePoint(0x1F4CC)}</span>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{template.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{template.description}</p>
                                            {template.isQuantitative && (
                                                <span className="inline-block mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                                    {template.targetValue} {template.unit || ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        {t('common.cancel', 'Cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

TemplateSelector.propTypes = {
    onSelectTemplate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TemplateSelector;
