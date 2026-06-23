import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../services/apiService';

const TemplateSelector = ({ onSelect }) => {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getTemplates()
            .then(res => setTemplates(res?.data?.templates || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>{t('loaders.loadingSimple')}</p>;
    if (!templates.length) return null;

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>{t('templates.title', { defaultValue: 'Plantillas rápidas' })}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {templates.map(tpl => (
                    <motion.button
                        key={tpl.id}
                        type="button"
                        whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect?.({ ...tpl.templateData, name: tpl.templateData?.name || tpl.name })}
                        style={{
                            textAlign: 'left',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'var(--card)',
                            cursor: 'pointer',
                        }}
                    >
                        <strong>{tpl.name}</strong>
                        {tpl.description && <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>{tpl.description}</p>}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector;
