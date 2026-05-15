// Mock for react-router-dom — renders links as plain anchor tags
const React = require('react');

const Link = ({ to, children, ...rest }) => {
  return React.createElement(
    'a',
    { href: to, ...rest },
    children
  );
};

const MemoryRouter = ({ children }) => React.createElement('div', null, children);

const BrowserRouter = ({ children }) => React.createElement('div', null, children);

module.exports = { Link, MemoryRouter, BrowserRouter };
