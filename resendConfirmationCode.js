var AWS = require("aws-sdk");
var AmazonCognitoIdentity = require("amazon-cognito-identity-js");
require("dotenv").config({ path: __dirname + "/.env" });

const UserPoolId = process.env.UserPoolId;
const ClientId = process.env.ClientId;
const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;
const REGION = process.env.region;
async function resendConfirmationCode(event) {
  console.log("hi");
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
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    let myPromise = new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode(function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    var result = await myPromise;
    const response = {
      status: "SUCCESS",
      message: "Resent confirmation code.",
    };
    console.log(response);
    return response;
  } catch (err) {
    var str = err + "";
    var exception = str.split(" ")[0];
    exception = exception.substring(0, exception.length - 10);
    var response = {
      status: "FAILED",
      message: err,
    };
    if (exception == "UserNotFound") {
      response = {
        status: "FAILED",
        message: "User not found. Enter the correct username.",
      };
    } else if (exception == "NotAuthorized") {
      response = {
        status: "FAILED",
        message: "Incorrect username.",
      };
    } else if (exception == "InvalidParameter") {
      response = {
        status: "FAILED",
        message: "Invalid Username.",
      };
    } else if (exception == "LimitExceeded") {
      response = {
        status: "FAILED",
        message: "Attempt limit exceeded, please try after some time.",
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
module.exports = { resendConfirmationCode };
