// frontend/app/src/components/tags/TagManager.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../services/apiService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TagBadge from './TagBadge';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10, transition: { duration: 0.15 } },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95 },
};

function TagManager({ onTagsChanged }) {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getTags();
      setTags(response?.data?.tags || []);
    } catch (err) {
      toast.error(err.message || t('common.error'));
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const openCreateModal = () => {
    setEditingTag(null);
    setFormName('');
    setFormColor('#3b82f6');
    setModalOpen(true);
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormColor(tag.color || '#3b82f6');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error(t('formValidation.nameRequired'));
      return;
    }

    try {
      if (editingTag) {
        await api.updateTag(editingTag.id, {
          name: formName.trim(),
          color: formColor,
        });
        toast.success(t('toast.tagUpdated'));
      } else {
        await api.createTag({
          name: formName.trim(),
          color: formColor,
        });
        toast.success(t('toast.tagCreated'));
      }
      setModalOpen(false);
      await fetchTags();
      if (onTagsChanged) onTagsChanged();
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }
  };

  const handleDelete = async (tag) => {
    if (!window.confirm(t('confirmationDialog.deleteTag', { name: tag.name }))) {
      return;
    }
    try {
      await api.deleteTag(tag.id);
      toast.success(t('toast.tagDeleted'));
      await fetchTags();
      if (onTagsChanged) onTagsChanged();
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[1.1rem] font-semibold text-[var(--foreground)] m-0">{t('tags.managerTitle')}</h3>
        <Button variant="primary" size="small" onClick={openCreateModal} leftIcon={<FaPlus />}>
          {t('tags.addTag')}
        </Button>
      </div>

      {isLoading && <p className="text-[var(--muted-foreground)]">{t('common.loading')}</p>}

      {!isLoading && tags.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">{t('tags.noTags')}</p>
      )}

      {!isLoading && tags.length > 0 && (
        <motion.div
            className="flex flex-col gap-2"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
          <AnimatePresence mode="popLayout">
            {tags.map((tag) => (
              <motion.div
                key={tag.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex justify-between items-center p-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  <TagBadge name={tag.name} color={tag.color} />
                </div>
                <div className="flex gap-1">
                  <button
                    className="bg-transparent border-none cursor-pointer p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded"
                    onClick={() => openEditModal(tag)}
                    aria-label={t('common.edit')}
                    title={t('common.edit')}
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    className="bg-transparent border-none cursor-pointer p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--muted)] rounded"
                    onClick={() => handleDelete(tag)}
                    aria-label={t('common.delete')}
                    title={t('common.delete')}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal for creating/editing tags */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="bg-[var(--card)] rounded-[var(--radius)] p-6 w-[90%] max-w-[400px] shadow-lg"
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
            >
              <h3 className="text-[1.1rem] font-semibold mb-4 text-[var(--foreground)]">
                {editingTag ? t('tags.editTag') : t('tags.createTag')}
              </h3>

              <div className="mb-4">
                <label htmlFor="tag-name-input" className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                  {t('tags.nameLabel')}
                </label>
                <Input
                  id="tag-name-input"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('tags.namePlaceholder')}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                  {t('tags.colorLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <motion.div
                      key={color}
                      className="w-8 h-8 rounded-full cursor-pointer"
                      style={{
                        backgroundColor: color,
                        border: formColor === color ? '3px solid var(--foreground)' : '3px solid transparent',
                      }}
                      onClick={() => setFormColor(color)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  {editingTag ? t('common.save') : t('common.create')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

TagManager.propTypes = {
  onTagsChanged: PropTypes.func,
};

export default TagManager;
