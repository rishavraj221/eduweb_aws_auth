# eduweb_aws_auth

## signup
<pre>
Req: {
  "body": {
    "FirstName": "Example",
    "LastName": "Example",
    "Password": "Example@123",
    "Email": "example@gmail.com",
    "PhoneNo": "+15555555555"
  },
  "resource": "signup"
}

Res: {
  "status": "SUCCESS",
  "message": "User created."
}
</pre>
## confirmEmail
<pre>
Req: {
  "body": {
    "Email": "example@gmail.com",
    "Password": "Example@123",
    "verificationCode": "123456"
  },
  "resource": "confirmEmail"
}

Res: {
  "status": "SUCCESS",
  "message": "User confirmed.",
  "idToken": ""
}
</pre>
## resendConfirmationCode
<pre>
Req: {
  "body": {
    "Email": "example@gmail.com"
  },
  "resource": "resendConfirmationCode"
}

Res: {
  "status": "SUCCESS",
  "message": "Resent confirmation code."
}
</pre>
## login
<pre>
Req: {
  "body": {
    "Email": "example@gmail.com",
    "Password": "Example@123"
  },
  "resource": "login"
}

Res: {
  "status": "SUCCESS",
  "message": "User logged.",
  "idToken": ""
}
</pre>
## forgotPassword
<pre>
Req: {
  "body": {
    "Email": "example@gmail.com"
  },
  "resource": "forgotPassword"
}

Res: {
  "status": "SUCCESS",
  "message": "Forgot password verification code sent to email.",
  "idToken": ""
}
</pre>
## newPassword
<pre>
Req: {
  "body": {
    "Email": "example@gmail.com",
    "Password": "Example@123",
    "verificationCode": "123456"
  },
  "resource": "newPassword"
}

Res: {
  "status": "SUCCESS",
  "message": "Password changed successfully.",
  "idToken": ""
}
</pre>
