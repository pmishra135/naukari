function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("success", 200);
define("statusSucc", "Success")
define("login", 'Login Successfully');
define("signup", 'Signup Successfully');
define("emailExist", 'Email already Exist');
define("otpSend", 'Otp send on your Email');
define("pwdChange", 'Password has been changed');
define("notFound", 404);
define("NF", 'Not Found');
define("verifyEmail", 'Email has been verified');
define("insertionDB", 'Error in insertion db');
define("exitUser", 'User does not exist');
define("sendMailErr", 'error in sending email');
define("otpExist", 'OTP does not exist');
define("del", 'document delete successfully');
define("errdel", 'error in delete document');
define("logout", 'logout successfully')
define("fail", 500);