// Mock for react-toastify — renders a simple container div
const React = require('react');

const ToastContainer = (props) => React.createElement('div', { ...props, 'data-testid': 'ToastContainer' });

module.exports = { ToastContainer };
