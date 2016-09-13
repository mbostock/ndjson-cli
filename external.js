module.exports = function(value, sandbox) {
  var i = value.lastIndexOf(":"),
      s = i >= 0 ? value.substring(i + 1) : value,
      m = i >= 0 ? value.substring(0, i) : value;
  if (!sandbox) sandbox = {};
  sandbox[s] = require(m);
  return sandbox;
};
