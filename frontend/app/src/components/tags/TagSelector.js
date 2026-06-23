import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../services/apiService';
import TagBadge from './TagBadge';

const TagSelector = ({ selectedTagIds = [], onChange }) => {
    const { t } = useTranslation();
    const [tags, setTags] = useState([]);

    useEffect(() => {
        api.getTags()
            .then(res => setTags(res?.data?.tags || []))
            .catch(() => setTags([]));
    }, []);

    const toggle = (id) => {
        const next = selectedTagIds.includes(id)
            ? selectedTagIds.filter(tid => tid !== id)
            : [...selectedTagIds, id];
        onChange?.(next);
    };

    if (!tags.length) return null;

    return (
        <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                {t('tagsPage.selectTags', { defaultValue: 'Etiquetas' })}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {tags.map(tag => (
                    <motion.div key={tag.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                        <TagBadge
                            tag={tag}
                            onClick={() => toggle(tag.id)}
                            style={selectedTagIds.includes(tag.id) ? { opacity: 1 } : { opacity: 0.5 }}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TagSelector;
