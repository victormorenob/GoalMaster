require('dotenv').config({ path: './.env.test' });

module.exports = {
  displayName: 'frontend',
  testEnvironment: 'jsdom',
  rootDir: '.',
  testMatch: ['<rootDir>/frontend/app/src/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/frontend/app/src/App.test.js'],
  setupFilesAfterEnv: ['<rootDir>/frontend/app/src/setupTests.js'],
  moduleNameMapper: {
    '\\.module\\.css$': '<rootDir>/frontend/app/__mocks__/styleMock.js',
    '\\.css$': '<rootDir>/frontend/app/__mocks__/styleMock.js',
    '^react-i18next$': '<rootDir>/frontend/app/__mocks__/react-i18next.js',
    '^react-router-dom$': '<rootDir>/frontend/app/__mocks__/react-router-dom.js',
    '^react-icons/fa$': '<rootDir>/frontend/app/__mocks__/react-icons-fa.js',
    '^react-toastify$': '<rootDir>/frontend/app/__mocks__/react-toastify.js',
    '^react-tooltip$': '<rootDir>/frontend/app/__mocks__/react-tooltip.js',
    '^i18next$': '<rootDir>/frontend/app/__mocks__/i18next.js',
    '^i18next-http-backend$': '<rootDir>/frontend/app/__mocks__/i18next-http-backend.js',
    '^i18next-browser-languagedetector$': '<rootDir>/frontend/app/__mocks__/i18next-browser-languagedetector.js',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/frontend/app/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  clearMocks: true,
};
