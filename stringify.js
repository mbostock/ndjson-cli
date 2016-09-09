module.exports = function(value) {
  return value == null ? "null" : JSON.stringify(value);
};
