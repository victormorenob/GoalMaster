// Mock for i18next
const i18n = {
  use: () => i18n,
  init: () => i18n,
  on: () => i18n,
  changeLanguage: () => {},
  language: 'en',
  t: (key) => key,
};

module.exports = i18n;
