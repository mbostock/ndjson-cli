process.stdout.on("error", function(error) {
  if (error.code === "EPIPE" || error.errno === "EPIPE") {
    process.exit(0);
  }
});

module.exports = function(value) {
  process.stdout.write(value == null ? "null\n" : JSON.stringify(value) + "\n");
};
