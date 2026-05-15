// frontend/app/src/components/tags/TagSelector.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import TagBadge from './TagBadge';

const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, y: -5, scale: 0.95, transition: { duration: 0.1 } },
};

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
      const exactMatch = filteredTags.find(
        (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
      );
      if (exactMatch) {
        handleSelectTag(exactMatch.name);
      } else {
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
    <div ref={containerRef} className="relative w-full">
      <div
        className="flex flex-wrap gap-1 p-2 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--card)] min-h-[2.5rem] cursor-text items-center"
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
          className="border-none outline-none flex-[1_1_100px] min-w-[80px] p-[0.2rem] text-sm bg-transparent text-[var(--foreground)]"
          style={{ color: 'var(--foreground)' }}
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredTags.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 z-50 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] shadow-lg max-h-[200px] overflow-y-auto mt-1"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {filteredTags.map((tag) => (
              <motion.div
                key={tag.id || tag.name}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[var(--muted)] text-[var(--foreground)]"
                onClick={() => handleSelectTag(tag.name)}
                whileHover={{ backgroundColor: 'var(--muted)' }}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color || '#3b82f6' }} />
                <span>{tag.name}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {isOpen && inputValue && filteredTags.length === 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 z-50 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] shadow-lg mt-1"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-3 py-2 text-sm opacity-60 cursor-default text-[var(--muted-foreground)]">
              Press Enter to add &ldquo;{inputValue}&rdquo;
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
