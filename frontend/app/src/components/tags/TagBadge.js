// frontend/app/src/components/tags/TagBadge.js
import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

function TagBadge({ name, color, onRemove, size = 'small' }) {
  const bgColor = color || '#3b82f6';
  const textColor = 'white';

  const fontSize = size === 'small' ? '0.75rem' : '0.85rem';
  const padding = size === 'small' ? '0.15rem 0.6rem' : '0.25rem 0.8rem';

  return (
    <motion.span
      className="inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontSize,
        padding,
        cursor: onRemove ? 'pointer' : 'default',
      }}
      title={name}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {name}
      {onRemove && (
        <span
          onClick={onRemove}
          style={{
            marginLeft: '0.25rem',
            cursor: 'pointer',
            opacity: 0.8,
            fontSize: '0.7rem',
            lineHeight: 1,
          }}
          aria-label={`Remove tag ${name}`}
        >
          ✕
        </span>
      )}
    </motion.span>
  );
}

TagBadge.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  onRemove: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium']),
};

export default TagBadge;
