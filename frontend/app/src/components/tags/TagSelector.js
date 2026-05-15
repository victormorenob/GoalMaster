// frontend/app/src/components/tags/TagSelector.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import TagBadge from './TagBadge';

const containerStyle = {
  position: 'relative',
  width: '100%',
};

const inputWrapperStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.35rem',
  padding: '0.4rem 0.5rem',
  border: '1px solid var(--border, #d1d5db)',
  borderRadius: 'var(--radius, 0.4rem)',
  backgroundColor: 'var(--card, #fff)',
  minHeight: '2.5rem',
  cursor: 'text',
  alignItems: 'center',
};

const inputStyle = {
  border: 'none',
  outline: 'none',
  flex: '1 1 100px',
  minWidth: '80px',
  padding: '0.2rem',
  fontSize: '0.9rem',
  backgroundColor: 'transparent',
  color: 'var(--foreground, #1f2937)',
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: 'var(--card, #fff)',
  border: '1px solid var(--border, #d1d5db)',
  borderRadius: 'var(--radius, 0.4rem)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  zIndex: 50,
  maxHeight: '200px',
  overflowY: 'auto',
  marginTop: '2px',
};

const dropdownItemStyle = (isSelected) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  cursor: 'pointer',
  fontSize: '0.9rem',
  backgroundColor: isSelected ? 'var(--muted, #f3f4f6)' : 'transparent',
  color: 'var(--foreground, #1f2937)',
  transition: 'background-color 0.15s',
});

const colorCircleStyle = (color) => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: color || '#3b82f6',
  flexShrink: 0,
});

function TagSelector({ availableTags = [], selectedTags = [], onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filteredTags = availableTags.filter(
    (tag) =>
      !selectedTags.includes(tag.name) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelectTag = useCallback(
    (tagName) => {
      const newSelected = [...selectedTags, tagName];
      onChange(newSelected);
      setInputValue('');
      inputRef.current?.focus();
    },
    [selectedTags, onChange]
  );

  const handleRemoveTag = useCallback(
    (tagName) => {
      const newSelected = selectedTags.filter((t) => t !== tagName);
      onChange(newSelected);
    },
    [selectedTags, onChange]
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // If there's a matching tag in filteredTags, select it
      const exactMatch = filteredTags.find(
        (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
      );
      if (exactMatch) {
        handleSelectTag(exactMatch.name);
      } else {
        // Allow creating a free-form tag if it doesn't exist in availableTags
        handleSelectTag(inputValue.trim());
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
    if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTagColor = (tagName) => {
    const tag = availableTags.find((t) => t.name === tagName);
    return tag?.color || '#3b82f6';
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div
        style={inputWrapperStyle}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map((tagName) => (
          <TagBadge
            key={tagName}
            name={tagName}
            color={getTagColor(tagName)}
            onRemove={() => handleRemoveTag(tagName)}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? 'Search or add tags...' : ''}
          style={inputStyle}
        />
      </div>

      {isOpen && filteredTags.length > 0 && (
        <div style={dropdownStyle}>
          {filteredTags.map((tag) => (
            <div
              key={tag.id || tag.name}
              style={dropdownItemStyle(false)}
              onClick={() => handleSelectTag(tag.name)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--muted, #f3f4f6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <span style={colorCircleStyle(tag.color)} />
              <span>{tag.name}</span>
            </div>
          ))}
        </div>
      )}

      {isOpen && inputValue && filteredTags.length === 0 && (
        <div style={dropdownStyle}>
          <div style={{ ...dropdownItemStyle(false), opacity: 0.6, cursor: 'default' }}>
            Press Enter to add "{inputValue}"
          </div>
        </div>
      )}
    </div>
  );
}

TagSelector.propTypes = {
  availableTags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ),
  selectedTags: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

export default TagSelector;
