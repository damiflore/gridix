export const memoize = (fn) => {
  let called = false;
  let value;
  return (...args) => {
    if (called) {
      return value;
    }
    value = fn(...args);
    called = true;
    return value;
  };
};
