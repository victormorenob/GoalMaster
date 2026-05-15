// frontend/app/src/components/tags/TagManager.js
import React, { useState, useEffect, useCallback } from 'react';
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

const containerStyle = {
  padding: '1rem',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
};

const titleStyle = {
  fontSize: '1.1rem',
  fontWeight: 600,
  color: 'var(--foreground)',
  margin: 0,
};

const tagListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const tagItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--card)',
};

const tagItemLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const colorDotStyle = (color) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: color,
  flexShrink: 0,
});

const tagActionsStyle = {
  display: 'flex',
  gap: '0.35rem',
};

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem',
  color: 'var(--muted-foreground)',
  fontSize: '0.9rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'background-color 0.15s',
};

// Modal styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: 'var(--card, #fff)',
  borderRadius: 'var(--radius, 0.4rem)',
  padding: '1.5rem',
  width: '90%',
  maxWidth: '400px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
};

const modalTitleStyle = {
  fontSize: '1.1rem',
  fontWeight: 600,
  marginBottom: '1rem',
  color: 'var(--foreground)',
};

const colorGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const colorSwatchStyle = (color, isSelected) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: color,
  cursor: 'pointer',
  border: isSelected ? '3px solid var(--foreground)' : '3px solid transparent',
  transition: 'transform 0.15s, border-color 0.15s',
});

const modalActionsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.5rem',
  marginTop: '1rem',
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
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{t('tags.managerTitle')}</h3>
        <Button variant="primary" size="small" onClick={openCreateModal} leftIcon={<FaPlus />}>
          {t('tags.addTag')}
        </Button>
      </div>

      {isLoading && <p>{t('common.loading')}</p>}

      {!isLoading && tags.length === 0 && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
          {t('tags.noTags')}
        </p>
      )}

      {!isLoading && tags.length > 0 && (
        <div style={tagListStyle}>
          {tags.map((tag) => (
            <div key={tag.id} style={tagItemStyle}>
              <div style={tagItemLeftStyle}>
                <span style={colorDotStyle(tag.color)} />
                <TagBadge name={tag.name} color={tag.color} />
              </div>
              <div style={tagActionsStyle}>
                <button
                  style={iconButtonStyle}
                  onClick={() => openEditModal(tag)}
                  aria-label={t('common.edit')}
                  title={t('common.edit')}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--muted)'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                >
                  <FaEdit />
                </button>
                <button
                  style={iconButtonStyle}
                  onClick={() => handleDelete(tag)}
                  aria-label={t('common.delete')}
                  title={t('common.delete')}
                  onMouseEnter={(e) => { e.target.style.color = 'var(--destructive)'; e.target.style.backgroundColor = 'var(--muted)'; }}
                  onMouseLeave={(e) => { e.target.style.color = 'var(--muted-foreground)'; e.target.style.backgroundColor = 'transparent'; }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating/editing tags */}
      {modalOpen && (
        <div style={modalOverlayStyle} onClick={() => setModalOpen(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalTitleStyle}>
              {editingTag ? t('tags.editTag') : t('tags.createTag')}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="tag-name-input"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  marginBottom: '0.3rem',
                  color: 'var(--foreground)',
                }}
              >
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

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                  color: 'var(--foreground)',
                }}
              >
                {t('tags.colorLabel')}
              </label>
              <div style={colorGridStyle}>
                {COLORS.map((color) => (
                  <div
                    key={color}
                    style={colorSwatchStyle(color, formColor === color)}
                    onClick={() => setFormColor(color)}
                  />
                ))}
              </div>
            </div>

            <div style={modalActionsStyle}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {editingTag ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

TagManager.propTypes = {
  onTagsChanged: PropTypes.func,
};

export default TagManager;
