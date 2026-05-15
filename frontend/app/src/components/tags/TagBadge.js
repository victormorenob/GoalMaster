// frontend/app/src/components/tags/TagBadge.js
import React from 'react';
import PropTypes from 'prop-types';

const TAG_BADGE_STYLES = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.15rem 0.6rem',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
};

function TagBadge({ name, color, onRemove, size = 'small' }) {
  const bgColor = color || '#3b82f6';
  const textColor = 'white';

  const badgeStyle = {
    ...TAG_BADGE_STYLES,
    backgroundColor: bgColor,
    color: textColor,
    fontSize: size === 'small' ? '0.75rem' : '0.85rem',
    padding: size === 'small' ? '0.15rem 0.6rem' : '0.25rem 0.8rem',
    cursor: onRemove ? 'pointer' : 'default',
  };

  return (
    <span style={badgeStyle} title={name}>
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
    </span>
  );
}

TagBadge.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  onRemove: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium']),
};

export default TagBadge;
