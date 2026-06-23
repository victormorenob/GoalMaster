import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../services/apiService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import TagBadge from './TagBadge';

const TagManager = () => {
    const { t } = useTranslation();
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [form, setForm] = useState({ name: '', color: '#4F46E5' });
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchTags = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getTags();
            setTags(response?.data?.tags || []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTags(); }, [fetchTags]);

    const openCreateModal = () => {
        setEditingTag(null);
        setForm({ name: '', color: '#4F46E5' });
        setModalOpen(true);
    };

    const openEditModal = (tag) => {
        setEditingTag(tag);
        setForm({ name: tag.name, color: tag.color });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        try {
            if (editingTag) {
                await api.updateTag(editingTag.id, form);
                toast.success(t('toast.tagUpdated', { defaultValue: 'Etiqueta actualizada' }));
            } else {
                await api.createTag(form);
                toast.success(t('toast.tagCreated', { defaultValue: 'Etiqueta creada' }));
            }
            setModalOpen(false);
            fetchTags();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.deleteTag(deleteTarget.id);
            toast.success(t('toast.tagDeleted', { defaultValue: 'Etiqueta eliminada' }));
            setDeleteTarget(null);
            fetchTags();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>{t('loaders.loadingSimple')}</p>;

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="tags-manager">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{t('tagsPage.title', { defaultValue: 'Mis etiquetas' })}</h2>
                <Button variant="primary" size="small" onClick={openCreateModal} leftIcon={<FaPlus />}>
                    {t('tagsPage.newTag', { defaultValue: 'Nueva etiqueta' })}
                </Button>
            </div>

            {tags.length === 0 ? (
                <div className="empty-state-card">
                    <p>{t('tagsPage.empty', { defaultValue: 'Aún no tienes etiquetas. Créalas para organizar tus objetivos.' })}</p>
                    <Button variant="primary" onClick={openCreateModal}>{t('tagsPage.createFirst', { defaultValue: 'Crear primera etiqueta' })}</Button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {tags.map(tag => (
                        <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--card)' }}>
                            <TagBadge tag={tag} />
                            <Button variant="ghost" size="small" onClick={() => openEditModal(tag)} leftIcon={<FaEdit />} />
                            <Button variant="ghost" size="small" onClick={() => setDeleteTarget(tag)} leftIcon={<FaTrash />} />
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <h3>{editingTag ? t('tagsPage.editTag', { defaultValue: 'Editar etiqueta' }) : t('tagsPage.newTag', { defaultValue: 'Nueva etiqueta' })}</h3>
                        <Input label={t('tagsPage.name', { defaultValue: 'Nombre' })} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <Input label={t('tagsPage.color', { defaultValue: 'Color' })} type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
                            <Button variant="primary" onClick={handleSave}>{t('common.save')}</Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationDialog
                isOpen={!!deleteTarget}
                title={t('confirmationDialog.deleteTagTitle', { defaultValue: 'Eliminar etiqueta' })}
                message={t('confirmationDialog.deleteTag', { name: deleteTarget?.name, defaultValue: `¿Eliminar "${deleteTarget?.name}"?` })}
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
                confirmButtonVariant="destructive"
            />
        </motion.div>
    );
};

export default TagManager;
