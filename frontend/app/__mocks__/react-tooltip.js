// Mock for react-tooltip — renders a simple div
const React = require('react');

const Tooltip = (props) => React.createElement('div', { ...props, 'data-testid': 'Tooltip' });

module.exports = { Tooltip };
