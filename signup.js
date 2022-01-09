var AWS = require("aws-sdk");
var AmazonCognitoIdentity = require("amazon-cognito-identity-js");
require("dotenv").config({ path: __dirname + "/.env" });

const UserPoolId = process.env.UserPoolId;
const ClientId = process.env.ClientId;

async function signUp(event) {
  try {
    var poolData = {
      UserPoolId: UserPoolId, // Your user pool id here
      ClientId: ClientId, // Your client id here (client1)
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var attributeList = [];

    var dataEmail = {
      Name: "email",
      Value: event.body.Email,
    };

    var dataPhoneNumber = {
      Name: "phone_number",
      Value: event.body.PhoneNo,
    };

    var dataFirstName = {
      Name: "custom:firstName",
      Value: event.body.FirstName,
    };

    var dataLastName = {
      Name: "custom:lastName",
      Value: event.body.LastName,
    };

    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataEmail
    );
    var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataPhoneNumber
    );
    var attributeFirstName = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataFirstName
    );
    var attributeLastName = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataLastName
    );
    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);
    attributeList.push(attributeFirstName);
    attributeList.push(attributeLastName);

    let myPromise = new Promise(function (myResolve, myReject) {
      userPool.signUp(
        event.body.Email,
        event.body.Password,
        attributeList,
        null,
        function (err, result) {
          if (result) {
            myResolve(result);
          } else {
            myReject(err);
          }
        }
      );
    });
    const result = await myPromise;
    const response = {
      status: "SUCCESS",
      message: "User created.",
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
    if (exception == "UsernameExists") {
      response = {
        status: "FAILED",
        message: "User already exists.",
      };
    } else if (exception == "InvalidPassword") {
      response = {
        status: "FAILED",
        message:
          "Invalid Password. Minimum length should be 8. Password must have lowercase, uppercase, numeric, and symbol characters.",
      };
    } else if (exception == "InvalidParameter") {
      response = {
        status: "FAILED",
        message: "Invalid Username/Password/Email/PhoneNo format.",
      };
    } else if (exception == "LimitExceeded") {
      response = {
        status: "FAILED",
        message: "Exceeded daily email limit for the operation or the account.",
      };
    } else if (exception == "CodeDeliveryFailure") {
      response = {
        status: "FAILED",
        message: "Verification code fails to deliver successfully.",
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
module.exports = { signUp };
