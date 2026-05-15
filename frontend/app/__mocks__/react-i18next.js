// Mock for react-i18next — returns the translation key as the translated string
const React = require('react');

const useTranslation = () => ({
  t: (key) => key,
  i18n: {
    language: 'en',
    changeLanguage: jest.fn(),
  },
});

const Trans = ({ i18nKey, children, ...rest }) => {
  return React.createElement(
    'span',
    rest,
    children || i18nKey || ''
  );
};

module.exports = {
  useTranslation,
  Trans,
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
};
