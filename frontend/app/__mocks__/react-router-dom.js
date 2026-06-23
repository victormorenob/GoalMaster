// Mock for react-router-dom — extended for ProtectedRoute and Link tests
const React = require('react');

const Link = ({ to, children, className, ...rest }) =>
  React.createElement('a', { href: to, className: typeof className === 'string' ? className : undefined, ...rest }, children);

const MemoryRouter = ({ children }) => React.createElement('div', null, children);
const BrowserRouter = ({ children }) => React.createElement('div', null, children);
const Routes = ({ children }) => React.createElement('div', null, children);
const Route = ({ element, children }) => element || React.createElement('div', null, children);
const Outlet = () => React.createElement('div', { 'data-testid': 'outlet' });
const Navigate = ({ to }) => React.createElement('div', { 'data-testid': 'navigate', 'data-to': to });
const useLocation = () => ({ pathname: '/dashboard', state: null });
const useNavigate = () => jest.fn();
const matchPath = () => null;

module.exports = {
  Link,
  MemoryRouter,
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
  useNavigate,
  matchPath,
  NavLink: Link,
};
