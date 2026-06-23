import React from 'react';
import Button from './Button';

function EmptyState({ icon, title, description, actionLabel, onAction }) {
    return (
        <div className="empty-state" role="status">
            {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
            <h3 className="empty-state-title">{title}</h3>
            {description && <p className="empty-state-description">{description}</p>}
            {actionLabel && onAction && (
                <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
}

export default EmptyState;
