var AWS = require("aws-sdk");
var AmazonCognitoIdentity = require("amazon-cognito-identity-js");
require("dotenv").config({ path: __dirname + "/.env" });

const UserPoolId = process.env.UserPoolId;
const ClientId = process.env.ClientId;
const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;
const REGION = process.env.region;
const IDENTITYPOOlID = process.env.IdentityPoolId;
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
    console.log(result);
    var authenticationData = {
      Username: event.body.Email,
      Password: event.body.newPassword,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      authenticationData
    );
    let tempPro = new Promise(function (resolve, reject) {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          var IdToken = result.getIdToken().getJwtToken();
          AWS.config.region = REGION;
          const logins = `cognito-idp.${REGION}.amazonaws.com/${UserPoolId}`;
          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IDENTITYPOOlID, // your identity pool id here
            Logins: {
              // Change the key below according to the specific region your user pool is in.
              "cognito-idp.$us-east-2.amazonaws.com/us-east-2_wa3HSum0L": result
                .getIdToken()
                .getJwtToken(),
            },
          });
          //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
          AWS.config.credentials.refresh((error) => {
            if (error) {
              reject(error);
            }
          });
          resolve(IdToken);
        },

        onFailure: function (err) {
          reject(err);
        },
      });
    });

    var IdToken = await tempPro;
    const response = {
      status: "SUCCESS",
      message: "Password changed successfully.",
      idToken: IdToken,
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
    console.log(response);
    return response;
  }
}
module.exports = { newPassword };
