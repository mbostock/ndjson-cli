module.exports = function(value) {
  process.stdout.write(value == null ? "null\n" : JSON.stringify(value) + "\n");
};
