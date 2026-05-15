// frontend/app/src/components/ui/DragHandle.jsx
import React from 'react';

const DragHandle = ({ ...props }) => {
    return (
        <button
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors touch-none"
            aria-label="Drag to reorder"
            tabIndex={-1}
            {...props}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="5" cy="3" r="1.5" />
                <circle cx="11" cy="3" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
                <circle cx="11" cy="8" r="1.5" />
                <circle cx="5" cy="13" r="1.5" />
                <circle cx="11" cy="13" r="1.5" />
            </svg>
        </button>
    );
};

export default DragHandle;
