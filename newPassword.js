var AWS = require("aws-sdk");
var AmazonCognitoIdentity = require("amazon-cognito-identity-js");
require("dotenv").config({ path: __dirname + "/.env" });

const UserPoolId = process.env.UserPoolId;
const ClientId = process.env.ClientId;

async function newPassword(event) {
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
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    var myPromise = new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(
        event.body.verificationCode,
        event.body.newPassword,
        {
          onFailure(err) {
            reject(err);
          },
          onSuccess(result) {
            resolve(result);
          },
        }
      );
    });
    var result = await myPromise;
    cognitoUser = userPool.getCurrentUser();
    let tempPro = new Promise((resolve, reject) => {
      cognitoUser.getSession(function (err, session) {
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
    const response = {
      status: "SUCCESS",
      message: "Password changed successfully.",
      idToken: IdToken,
    };
    // console.log(response);
    return response;
  } catch (err) {
    var str = err + "";
    var exception = str.split(" ")[0];
    exception = exception.substring(0, exception.length - 10);
    var response = {
      status: "FAILED",
      message: err,
    };

    if (exception == "CodeMismatch") {
      response = {
        status: "FAILED",
        message: "Invalid verification code provided.",
      };
    } else if (exception == "ExpiredCode") {
      response = {
        status: "FAILED",
        message:
          "Invalid code provided, please request a code again/Incorrect username.",
      };
    } else if (exception == "InvalidParameter") {
      response = {
        status: "FAILED",
        message: "Invalid verificationCode/Username provided.",
      };
    } else if (exception == "InvalidPassword") {
      response = {
        status: "FAILED",
        message:
          "Invalid Password. Minimum length should be 8. Password must have lowercase, uppercase, numeric, and symbol characters.",
      };
    } else if (exception == "TooManyFailedAttempts") {
      response = {
        status: "FAILED",
        message: "User has made too many failed attempts.",
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
module.exports = { newPassword };
