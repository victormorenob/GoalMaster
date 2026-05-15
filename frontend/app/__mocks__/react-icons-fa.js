// Mock for react-icons/fa — renders a simple span
const React = require('react');

const FaArrowRight = (props) => React.createElement('span', { ...props, 'data-testid': 'FaArrowRight' }, '→');

module.exports = { FaArrowRight };
