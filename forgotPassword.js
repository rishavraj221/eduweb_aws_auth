var AWS = require("aws-sdk");
var AmazonCognitoIdentity = require("amazon-cognito-identity-js");
require("dotenv").config({ path: __dirname + "/.env" });

const UserPoolId = process.env.UserPoolId;
const ClientId = process.env.ClientId;
const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;
const REGION = process.env.region;

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
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    var params = {
      UserPoolId: UserPoolId,
      AttributesToGet: ["email"],
      Filter: `email = "${event.body.Email}"`,
    };

    let tempPro = new Promise((resolve, reject) => {
      AWS.config.update({
        region: REGION,
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      });
      var cognitoidentityserviceprovider =
        new AWS.CognitoIdentityServiceProvider();
      cognitoidentityserviceprovider.listUsers(params, (err, data) => {
        if (err) {
          console.log("err");
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    var temp = await tempPro;
    console.log(temp);
    if (temp.Users.length == 0) {
      throw Error("User does not exist.");
    }

    if (temp.Users[0].UserStatus === "UNCONFIRMED") {
      throw Error("User is not confirmed.");
    }
    var myPromise = new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onFailure(err) {
          reject(err);
        },
        onSuccess(result) {
          resolve(result);
        },
      });
    });
    var result = await myPromise;
    const response = {
      status: "SUCCESS",
      message: "Forgot password verification code sent to email.",
    };
    console.log(response);
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
    console.log(response);
    return response;
  }
}
module.exports = { forgotPassword };
