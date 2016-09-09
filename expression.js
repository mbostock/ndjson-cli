var acorn = require("acorn"),
    path = require("path"),
    vm = require("vm");

module.exports = function(value, name) {
  try {
    var node = acorn.parse("(" + value + ")", {preserveParens: true});
    if (node.type !== "Program") throw new Error("Expected program");
    if (node.body.length !== 1) throw new Error("Invalid expression");
    if (node.body[0].type !== "ExpressionStatement") throw new Error("Expected expression statement");
    if (node.body[0].expression.type !== "ParenthesizedExpression") throw new Error("Expected expression");
    return new vm.Script("(" + value + ")");
  } catch (error) {
    console.error(path.basename(process.argv[1]) + ":" + (name === undefined ? "expression" : name));
    console.error(value);
    console.error("^");
    console.error("SyntaxError: " + error.message);
    process.exit(1);
  }
};
