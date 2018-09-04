let User = require('../model/user.js');
let OTP = require('../model/otp.js');
var mongoose = require("mongoose");
var constant = require('./constant');
let userController = require('../controller/userController');
const rp = require('request-promise');
const logger = require('../utils/logger').logger;
const nodemailer = require('nodemailer');

 var emailcheck = (data)=> {
    var result ={}
  var dataObject ={}
  dataObject.email  = data.email;
 
  return new Promise(function (resolve, reject){
    User.findOne({"email": dataObject.email} ,dataObject, function(err,user){
      console.log(user)
        if(err){
         logger.error("Error in the login : ",err);
         reject(err);
            }else{
    if(!user){
        result.code = false
        console.log('>>>>>>>')
        }
    else
        {    
    if(user){
           result.code = true
           console.log('>>>>>>><<<<<<<<<<<')
          }
         }
     resolve(result);
      } 
    });        
   });
  }

   var phoneheck = (data)=> {
  var result ={}
  var dataObject ={}
  dataObject.email  = data.email;
 
  return new Promise(function (resolve, reject){
    User.findOne({"mobileNo": dataObject.email} ,dataObject, function(err,user){
      console.log(user)
    if(err){
         logger.error("Error in the login : ",err);
         reject(err);
     }else{
      if(!user){
        result.code = false
      }
      else
        {    
         if(user){
           result.code = true
          }
         }
         resolve(result);
      } 
    });        
   });
  }

   var createOTP = (data)=> {
        var result ={}
        var dataObject ={}
        dataObject.email  = data.email;
        return new Promise(function (resolve, reject){
        var OTPvalue = Math.floor(100000 + Math.random() * 900000);
        dataObject.OTP = OTPvalue;
        console.log("check OTP details", OTPvalue)
        if(OTP){
            OTP.findOne( {"email":data.email})
            .then(function(data){
                console.log("data",data)
                if(data){
                    console.log("++++++++++++++++++")
                    OTP.update({email:dataObject.email}, { $set: { otp:  dataObject.OTP , isActive : 0   } })
                    .then(function(data){
                        console.log("data check", data)
                        resolve(dataObject)
                    }).catch(function(err){
                        logger.error("error is ", err)
                        reject (err)
                    })
                }
                else
                {
                    console.log("<<<<<<<<<<<<<<<<<<")
                    var otpObj = new OTP({
                    email     : dataObject.email,
                    otp  : dataObject.OTP,
                });
                console.log("check the value of otp object", otpObj)
                otpObj.save(function(err){
                    console.log("<<<<<<<<?????????")
                if(err)
                    {
                    logger.error("Error in insertion to database");
                    reject(err);
                    }                
                    else{
                        logger.info("Successfully  insertion in database");
                        result.email= dataObject.email;
                        result.OTP= dataObject.OTP;
                        console.log("?????",result)
                        }
                        resolve(result);
                    });

                }
            }).catch(function(err){
                console.log("_____________________",err)
                reject (err)
            })
        }
        else 
        {
            result.message = "error in generate otp"
            console.log("error")
            resolve(result)
        }
     })
    }




     var sendMaildata = (data)=> {
        var result ={}
        var dataObject ={}
        console.log("check the value of mail data",data)
        dataObject.email  = data.email;
       dataObject.OTP = data.OTP;
       console.log("check otp data", dataObject)
        return new Promise(function (resolve, reject){
            console.log("check data value", dataObject.OTP  )
            if(dataObject){
                console.log("?????????")
            /* var transport = nodemailer.createTransport("SMTP", {
				service: 'Gmail',
				auth: {
					user: "anshika.8om@gmail.com",
					pass: ""
				}
			});
		
		console.log('SMTP Configured');
		
		// Message object
		var message = {
		
			// sender info
			from: 'Sender Name <sender@example.com>',
		
			// Comma separated list of recipients
			to: '"Receiver Name" <anshika@csinfotech.org>',
		
			// Subject of the message
			subject: 'check the mail ✔', 
		
			// plaintext body
			text: 'Hello to myself!',
		};
		
		console.log('Sending Mail');
		transport.sendMail(message).then(function(data){
                console.log("data check value", data)
                resolve(data)
            }).catch(function(err){
                console.log("...........................@@@@.........",err)
                reject(err)
            });  */
            result.message = "  please check the mail for otp"
            result.OTP =  dataObject.OTP
            resolve(result)
        }else{
            console.log("else condition check")
            result.message="problem in otp"
            resolve(result)
        }
         });
    }

     var verifiedOtp = (data)=> {
        var result ={}
        var dataObject ={}
        console.log("check the value of mail data",data)
        dataObject.OTP = data.otp;
        dataObject.email = data.email;
       console.log("check otp data", dataObject)
        return new Promise(function (resolve, reject){
            if(dataObject){
                OTP.find({email:dataObject.email})
                .then(function(data){
                    console.log("print the data", data)
                if(data[0]){
                    if(data[0].isActive !=1){
                    console.log(">>>>>>",data[0].otp)
                    if(data[0].otp == dataObject.OTP){
                        console.log(",,,,,,,,,,,,,,")
                        OTP.update({email:dataObject.email}, { $set: { isActive: 1 } })
                        .then(function(data){
                            console.log("dtatttttaaaa heckkkkkk", data)
                            if(data.ok){
                                console.log("data.ok chhhheeecccckkkkkk")
                                result.message = true
                                console.log("reeeesssssuuuuuullllttttt check", result)
                                resolve(result)
                            }
                            else{
                                result.message = false
                                resolve(result)
                            }
                        })
                    }
                    else{

                        result.message ="otp is not correct"
                        resolve(result)
                    }
                }else{
                
                    result.message ="otp has been used"
                    resolve(result)
                }
            } else{
                console.log("????????????????????")
                result.message ="otp has been expired"
                resolve(result)
            } 
                }).catch(function(err){
                    console.log("checking for error", err)
                    reject(err)
                })
            }
         });
    }

   /*  exports.detail = function(data){
        var object ={}
         object.email = req.body.email;
         object.message = req.body.message;
         console.log
    } */

    module.exports ={emailcheck, phoneheck, createOTP,sendMaildata ,verifiedOtp}