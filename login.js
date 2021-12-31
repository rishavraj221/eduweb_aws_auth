var AWS = require("aws-sdk");
var AmazonCognitoIdentity = require("amazon-cognito-identity-js");
require("dotenv").config({ path: __dirname + "/.env" });

const UserPoolId = process.env.UserPoolId;
const ClientId = process.env.ClientId;
const IDENTITYPOOlID = process.env.IdentityPoolId;
async function login(event) {
  try {
    var poolData = {
      UserPoolId: UserPoolId, // Your user pool id here
      ClientId: ClientId, // Your client id here (client1)
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var authenticationData = {
      Username: event.body.Email,
      Password: event.body.Password,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      authenticationData
    );
    var userData = {
      Username: event.body.Email,
      Pool: userPool,
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    let tempPro = new Promise(function (resolve, reject) {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          var IdToken = result.getIdToken().getJwtToken();
          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IDENTITYPOOlID,
            Logins: {
              "cognito-idp.$us-east-2.amazonaws.com/us-east-2_wa3HSum0L": result
                .getIdToken()
                .getJwtToken(),
            },
          });
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
      message: "User logged.",
      idToken: IdToken,
    };
    // console.log(response);
    return response;
  } catch (err) {
    var str = err.code + "";
    var exception = str.split(" ")[0];
    exception = exception.substring(0, exception.length - 9);

    var response = {
      status: "FAILED",
      message: err,
    };

    if (exception == "InvalidParameter") {
      response = {
        status: "FAILED",
        message:
          "Invalid Username/Password format. These fields should not be empty.",
      };
    } else if (exception == "NotAuthorized") {
      response = {
        status: "FAILED",
        message: "Incorrect username or password.",
      };
    } else if (exception == "TooManyFailedAttempts") {
      response = {
        status: "FAILED",
        message: "Attempt limit exceeded, please try after some time.",
      };
    } else if (exception == "UserNotConfirmed") {
      response = {
        status: "FAILED",
        message: "User is not confirmed.",
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
module.exports = { login };
