var AWS = require("aws-sdk");
var AmazonCognitoIdentity = require("amazon-cognito-identity-js");
require("dotenv").config({ path: __dirname + "/.env" });

const UserPoolId = process.env.UserPoolId;
const ClientId = process.env.ClientId;

async function forgotPassword(event) {
  try {
    var poolData = {
      UserPoolId: UserPoolId, // Your user pool id here
      ClientId: ClientId, // Your client id here (client1)
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
      Username: event.body.Email,
      Pool: userPool,
    };
    var result;
    var cogUser = userPool.getCurrentUser();
    if (cogUser == null) {
      throw Error(
        "User is not confirmed/authenticated. Confirm your email with the verification code"
      );
    }

    let tempPro = new Promise((resolve, reject) => {
      cogUser.getSession(function (err, session) {
        if (err) {
          reject(err);
        } else if (!session.isValid()) {
          reject("session is invalid");
        } else {
          var IdToken = session.getIdToken().getJwtToken();
          resolve(IdToken);
        }
      });
    });
    var IdToken = await tempPro;
    let tempPro1 = new Promise((resolve, reject) => {
      cogUser.getUserAttributes(function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    result = await tempPro1;

    if (result[1].Value) {
      let myPromise = new Promise((resolve, reject) => {
        cogUser.forgotPassword({
          onSuccess: function (data) {
            resolve(data);
          },
          onFailure: function (err) {
            reject(err);
          },
        });
      });
      var temp = await myPromise;
    } else {
      throw Error(
        "User is not confirmed/authenticated. Confirm your email with the verification code"
      );
    }
    const response = {
      status: "SUCCESS",
      message: "Forgot password verification code sent to email.",
      idToken: IdToken,
    };
    // console.log(response);
    return response;
  } catch (err) {
    console.log(err);
    var str = err + "";
    var exception = str.split(" ")[0];
    exception = exception.substring(0, exception.length - 10);
    var response = {
      status: "FAILED",
      message: err,
    };
    if (exception == "InvalidParameter") {
      response = {
        status: "FAILED",
        message: "Invalid Username. This field should not be empty.",
      };
    } else if (exception == "NotAuthorized") {
      response = {
        status: "FAILED",
        message: "Incorrect username.",
      };
    } else if (exception == "LimitExceeded") {
      response = {
        status: "FAILED",
        message: "Attempt limit exceeded, please try after some time.",
      };
    } else if (exception == "UserNotConfirmed") {
      response = {
        status: "FAILED",
        message: "User is not confirmed.",
      };
    } else if (exception == "CodeDeliveryFailure") {
      response = {
        status: "FAILED",
        message: "Verification code fails to deliver successfully.",
      };
    } else if (exception == "TooManyRequests") {
      response = {
        status: "FAILED",
        message: "User has made too many requests.",
      };
    } else {
      response = {
        status: "FAILED",
        message: str.split("\n")[0],
      };
    }
    // console.log(response);
    return response;
  }
}
module.exports = { forgotPassword };
