// Mock for CSS modules — returns a proxy so styles.anyName works in tests
module.exports = new Proxy(
  {},
  {
    get: (target, prop) => (prop in target ? target[prop] : prop),
  }
);
