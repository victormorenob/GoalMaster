import React from 'react';

function SkeletonLoader({ width = '100%', height = '1rem', className = '' }) {
    return (
        <div
            className={`skeleton-loader ${className}`.trim()}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
}

export default SkeletonLoader;
