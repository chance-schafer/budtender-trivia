// Convenience file to export all middleware
const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const errorHandler = require("./errorhandler");

module.exports = {
  authJwt,
  verifySignUp,
  errorHandler
};