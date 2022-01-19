const routeSignup = require("./signup.js");
const routeLogin = require("./login.js");
const routeConfirmEmail = require("./confirmEmail.js");
const routeForgotPassword = require("./forgotPassword.js");
const routeNewPassword = require("./newPassword.js");
const routeResend = require("./resendConfirmationCode.js");

exports.handler = async (event) => {
  if (event.resource == "signup") {
    return routeSignup.signUp(event);
  } else if (event.resource == "login") {
    return routeLogin.login(event);
  } else if (event.resource == "confirmEmail") {
    return routeConfirmEmail.confirmEmail(event);
  } else if (event.resource == "forgotPassword") {
    return routeForgotPassword.forgotPassword(event);
  } else if (event.resource == "newPassword") {
    return routeNewPassword.newPassword(event);
  } else if (event.resource == "resendConfirmationCode") {
    return routeResend.resendConfirmationCode(event);
  }
};
