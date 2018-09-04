var express = require('express');
var router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
let Education = require('../model/userEducation.js');
let User = require('../model/user.js');
let Experience = require('../model/experience.js');
let Country = require('../model/country.js');
const bcrypt = require('bcrypt-nodejs');
var mongoose = require("mongoose");
const rp = require('request-promise');
var constant = require('../utils/constant.js')
const nodemailer = require('nodemailer');
const logger = require('../utils/logger').logger;
//import {emailcheck , createOTP , sendMaildata , verifiedOtp} from '../utils/common.js';
var multiparty = require('multiparty');
var http = require('http');
var fs = require('fs');
var util = require('util');
var moment = require("moment")
var common = require('../utils/common')
var secretKey = require('../config/auth').secretKey;

var createToken = (user) => {
  return jsonwebtoken.sign({
    email:user.email
      }, secretKey ,{
        expiresIn:525600
    });
  }

  /* exports.checkData = function(req, res, next){
    var dataValue = {}
    dataValue.email= req.body.email
    emailcheck(dataValue).then(function(data){
      if (data){
        console.log("final result",data)
      }
    })
  } */


exports.register = function(req, res, next){
     
    var result ={}
    var dataObject ={}
    dataObject.email  = req.body.email;
    var signdata = (data)=> {
    return new Promise(function (resolve, reject){
        common.emailcheck(dataObject).then(function(dataObj){
            dataObject.password =req.body.password;
            dataObject.mobileNo = req.body.mobileNo;
            dataObject.username =req.body.username;
            var token = createToken(dataObject);
            dataObject.token = token;
            if (dataObj.code===false){
                var userObj = new User({
                    email     : dataObject.email,
                    password  : dataObject.password,
                    username : dataObject.username,
                    token : dataObject.token
                });
            userObj.save(function(err, data){
            if(err)
                    {
                        logger.error("Error in insertion to database");
                        reject(err);
                    }                
                    else{
                        logger.info("Successfully  insertion in database");

                        result.email= dataObject.email;
                        result.mobileNo= dataObject.mobileNo;
                        result.username = dataObject.username;
                        result.token = dataObject.token;
                        result._id = data._id;
                        console.log("?????",result)
                       
                    }
                    resolve(result);
                 });
            }else{
                logger.info("email already exist");
                result.message = "email exist"
                resolve(result);
            }
                    
        }).catch(function(err){
            logger.error("Error in insertion to database");
            reject(err);
        })
   });
  }
  signdata().then(function(dataresult){
      console.log("data result", dataresult)
      if(dataresult.message){
        res.json({
            "code": constant.notFound,
            "message": constant.emailExist
            });
        }
      else{
        res.json({
            "code": constant.success,
            "message":constant.signup,
            "data": dataresult
        });
       }
    return
        
  }).catch(function(err){
    logger.error("Error in database : "+err);
    res.json({
        "code"   :  constant.fail,
        "message":  constant.insertionDB + err.message
    });
  });
}

exports.Index = function(req, res){
    var result = {}; 
     res.pageInfo = {};
    res.pageInfo.title = 'hvpl';
    res.render('Index', res.pageInfo);
};

var comparePassword = (password, user) => {
    return bcrypt.compareSync(password, user.password);
};

exports.signin = function(req,res,next){
    var data = {}
    data.email = req.body.email;
    data.password = req.body.password;
    var result ={}
     User.findOne( {"email":data.email })
    .then(function (user) {
          if(user){
             result.username = user.username;
              result._id = user._id;
//result.price = user.price;
              //result.currencyType = user.currencyType;
          var token = createToken(user)
            if(token){
            User.update({email:user.email}, { $set: { token: token } })
            .then(function(data){
                console.log("data check", data)
            })
          var validPassword = comparePassword(data.password,user);
                  if(!validPassword){
                        res.json({
                            "code": constant.notFound,
                            "message": constant.NF
                          });   
                  }else{
                        result.email = user.email;
                        result.token = token
                        res.json({
                        "code": constant.success,
                        "message": constant.login ,
                        "data" : result                       
                        });
                    }
                }
                else {
                    res.json({
                        "code": constant.notFound,
                        "message": constant.insertionDB,
                      });
                    }
                 }
                else {
                    res.json({
                       "code": constant.notFound,
                        "message": constant.exitUser,
                      });
                    }
                return
    })
    .catch(function (err) {
        res.json(err);
        return;
    })
};

exports.resetPass = function(req, res, next)
{
    var data ={}
    data.email= req.body.email;
    data.password = req.body.password;
    data.password2 = req.body.password2;
    console.log("??????", data)
     User.findOne( {"email":data.email },data)
    .then(function (user) {
        if (user){
            var validPassword = comparePassword(data.password,user);
             if(!validPassword){
                res.json({
                   "code": constant.notFound,
                    "message": constant.NF,
                  });
                   
            }
            else{
              return  user
            }
         }
    }).then(function(user){
        console.log(user)
        user.password = req.body.password2;
        return user.save()
    }).then(function(data){
        console.log(data)
        res.json({
            "code":constant.success,
            "message": constant.pwdChange
        })
    }).catch(function(err){
        res.json(err)
        return;
    })
}

exports.allUser = function(req,res,next){
   
    
        User.find().then(function(data){
            res.json({
                "code": constant.success,
                "message": constant.login ,
                "data" : data                       
                });
            })
       
   
    
}

exports.forgetpwd = function(req, res, next){
     var  result ={}
    var dataValue = {}
    dataValue.email= req.body.email
    console.log("check data value", dataValue)
    var forgetpwddata = (data)=> {
        return new Promise(function (resolve, reject){
            common.emailcheck(dataValue).then(function(dataObj){
                if (dataObj.code===false){
                    console.log("....",dataObj)
                    logger.info("email does not exist");
                    result.message = constant.exitUser
                     resolve(result);
                }else{
                    console.log("/////////", dataObj)
                    common.createOTP(dataValue).then(function(resultOTP){
                       if(resultOTP.email){
                        common.sendMaildata(resultOTP).then(function(data){
                            console.log("check the value of send mail", data)
                            result.OTP = data.OTP;
                            result.message = data.message;
                           })
                        resolve(result)
                        }
                        else{
                            result.message= "error in otp";
                            console.log("error in otp", result)
                            resolve(result)
                        }
                    }).catch(function(err){
                        console.log("error check __________________", err)
                        result.message = err
                        reject(err)
                    })
                }
                        
            }).catch(function(err){
                logger.error("Error in insertion to database");
                reject(err);
            })
       });
      }

      forgetpwddata().then(function(data){
          if(data.message){
              console.log("data value", data)
          res.json({
            "code": constant.success,
            "message" : data.message,
            "OTP": data.OTP                       
            });
        }else{
            res.json({
                "code": constant.fail,
                "message" : constant.sendMailErr                      
                });

        }
      }).catch(function(err){
          res.json({
              code : constant.fail,
              message : constant.NF
          })
          return err
      })
  }


  exports.verifyotp = function (req, res, next){
      var data = {}
      data.otp = req.body.otp;
      data.pwd = req.body.password;
      data.email = req.body.email;
      console.log(data)
      var otpdata = (datac)=> { 
          console.log("llllllllll", data)
        return new Promise(function (resolve, reject){
            common.emailcheck(data).then(function(dataObj){
                if (dataObj.code===false){
                    console.log("....",dataObj)
                    logger.info("email does not exist");
                    res.json({
                        "code": constant.notFound,
                        "message" : constant.exitUser,
                         });
                } 
                else{  
                common.verifiedOtp(data).then(function(dataObj){
                if (dataObj.message===true){
                    console.log("....",dataObj)
                    logger.info("otp matched");
                    User.findOne( {"email":data.email })
                    .then(function (user) {
                        if (user){
                           return  user
                           }
                    }).then(function(user){
                        console.log(user)
                        user.password = req.body.password;
                        return user.save()
                    }).then(function(data){
                        console.log("...........0..",data)
                        res.json({
                            "code": constant.success,
                            "message" : constant.pwdChange,
                             });
                       /* result.message = 
                       resolve(result) */
                    }).catch(function(err){
                        res.json(err)
                        return;
                    })
                }else{
                    res.json({
                        "code": constant.notFound,
                        "message" : dataObj.message
                         });
                }
                  
            }).catch(function(err){
                logger.error("Error in insertion to database");
                reject(err);
            })
        }
       });
    });
    }
      otpdata().then(function(err){
          console.log("err",err)
        res.json({
            "code": constant.success,
            "message" : constant.otpExist,
                }).catch(function(){
                 res.json({
                     "code": constant.notFound,
                     "message":"unexpected error" + err
                 })
             });

      })
  }
exports.uploadFile = function(req, res, next) {
    var result ={}
    var dataObj ={}
    var fileUploadFun = (datac) => {
    var form = new multiparty.Form();

    /* form.parse(req); */
    return new Promise(function (resolve, reject){
        form.parse(req, function(err, fields, files) {
        if(err){
                console.log("checking for error", err)
                reject(err)
            }
        else{
            if(files){
                dataObj.token = fields.token[0]
                console.log("check obj value", dataObj)
                if(files.file){
                    var data = files.file[0]
                    var dataPath = data.path;
                    var fileName = data.originalFilename;
                    if(fileName){
                        var ext = fileName.substring(fileName.indexOf('.')+1);
                        console.log(ext);
                        if (ext){
                        var randomValue = Math.floor(100000 + Math.random() * 900000);
                        var UniqueFileName = moment().valueOf();
                        var dataValue = UniqueFileName+randomValue + "."+ext;
                            if (dataValue){
                            fileName = dataValue ;
                            var newPath = './server/public/' + fileName ;
                            console.log(newPath)
                                if(newPath) {
                                    fs.rename(dataPath, newPath, function(err){
                                        console.log("........")
                                        if(err) reject(err)
                                        fs.exists(dataPath, function(exists) {
                                            if(exists) {
                                            console.log('File exists. Deleting now ...');
                                            fs.unlink(dataPath, function(err){
                                                if(err) reject(err)
                                                else{
                                                User.update({token:dataObj.token}, { $set: { image: fileName } })
                                                .then(function(data){
                                                    if(data.ok){
                                                        console.log("data check", data)
                                                        resolve(fileName)
                                                    }
                                                    else{
                                                        result.message ="data not updated"
                                                        resolve(result)
                                                    }
                                                
                                                })
                                                }
                                            })
                                            } else{
                                            console.log('File not found, so not deleting.');
                                                User.update({token:dataObj.token}, { $set: { image: fileName } })
                                                    .then(function(data){
                                                        if(data.ok){
                                                            console.log("data check", data)
                                                            resolve(fileName)
                                                        }
                                                        else{
                                                            result.message ="data not updated"
                                                            resolve(result)
                                                        }
                                                    
                                                    })
                                            }
                                            
                                        });

                                    })
                                }else{
                                    result.message ="error in newPath"
                                    resolve(result)
                                }
                                
                            }else{
                                result.message ="error in naking a rename path"
                                resolve(result)
                            }

                        }
                        else{
                            result.messge ="error in getting extension of uploaded file"
                            resolve(result)
                        }
                    }else{
                        reject (err)
                        return
                    }
                }else{
                    console.log("check err", err)
                    result.message ="error in uploaded file"
                    resolve(result)
                }
            }
        }
           
        })
    });
}
fileUploadFun().then(function(data){
    console.log("////",data)
        if(data.message){
            console.log(">>>>>>>>>>>>,,,,,,,,,,,,", data.message)
            res.json({
                "code": constant.notFound,
                "message" : data.message
            });
        }else{
            console.log(">>>>>>>>>>>>,,,,,,,,,,,,............")
            res.json({
                "code": constant.success,
                "message" : "uploaded file successfully"
            });
        }
    }).catch(function(err){
        res.json({
            "code":"400",
            "message":"unexpected error" + err
        })
        return;
    })
}
/*
exports.updateprofile =function(req,res, next){
    var userProObj ={}
    var result ={}
	userProObj.dob = req.body.dob;
	userProObj.gender = req.body.gender;
	userProObj.city = req.body.city;
	userProObj.country = req.body.country;
	userProObj.state = req.body.state;
	userProObj.address =req.body.address;
	userProObj.pincode = req.body.pincode;
	userProObj.mobileNo = req.body.mobileNo;
    userProObj.email = req.body.email;
    userProObj.username = req.body.username;
    userProObj.userHeadline = req.body.headline;
    userProObj.userDescription = req.body.description;
    userProObj.token = req.body.token;
    console.log(userProObj)
    var updateData = (data)=> {
        return new Promise(function (resolve, reject){
            User.find({token:userProObj.token})
            .then(function(dataval){
                User.update({token:userProObj.token}, { $set: { dob:userProObj.dob, gender :userProObj.gender, city : userProObj.city ,country: userProObj.country,state: userProObj.state,address: userProObj.address,pincode:userProObj.pincod,mobileNo:userProObj.mobileNo,userHeadline:userProObj.userHeadline,userDescription: userProObj.userDescription,username: userProObj.username} })
                .then(function(dataObj){
                    console.log("ddddddddddddd", dataObj)
                if(dataObj.ok){
                    result.message="successfully uploaded"
                    resolve(result)
                }
                }).catch(function(err){
                    reject(err)
                })
            })
        })
    }

    updateData().then(function(resultdata){
        if(resultdata.message){
            res.json({
                "code": constant.success,
                "message" : "update successfully"
            });
        }
        else{
            res.json({
                "code": constant.notFound,
                "message" : data.message
            }); 

        }
    }).catch(function(err){
         
        res.json({
            "code": constant.notFound,
            "message":"unexpected error" + err
        })
        return;
    })

}
*/


exports.getProfileData = function(req, res, next){
    console.log("//////////////////")
    var userObject = {}
   var result ={}
    userObject.token= req.body.token;    if(userObject.token ==  null || undefined){
        console.log("??????????????")
            res.json({
            "code": constant.notFound,
            "message":"token value is null"
        })
    }
    else{
        console.log("++++++++++++++++++++++++")
        User.find({token:userObject.token}).then(function(datav){
            if(datav.length>0){
                console.log(datav)
            result.headline= datav[0].userHeadline
            result.description= datav[0].userDescription
            console.log(result)
                res.json({
                    "code": constant.success,
                    "message" :constant.statusSucc,
                    "data": result
                });
            
                console.log(datav)
            }else{
                res.json({
                    "code": constant.notFound,
                    "message":"token does not exist"
                })
            }
        }).catch(function(err){
            res.json({
                "code": constant.notFound,
                "message":"token does not exist"  
            })
        })
    }    }
exports.updateprofile =function(req,res, next){
    var userProObj ={}
    var result ={}
     userProObj.userHeadline = req.body.headline;
    userProObj.userDescription = req.body.description;
    userProObj.token = req.body.token;
    console.log(userProObj)
    var updateData = (data)=> {
           return new Promise(function (resolve, reject){
             if(userProObj.userHeadline){
                 if(userProObj.userDescription){
                     User.find({token:userProObj.token})
                     .then(function(dataval){
                         User.update({token:userProObj.token}, { $set: { userHeadline:userProObj.userHeadline,userDescription: userProObj.userDescription} })
                         .then(function(dataObj){
                         if(dataObj.ok){
                             result.message="successfully updated"
                             resolve(result)
                         }
                         }).catch(function(err){
                             reject(err)
                         })
                     })
                 }else{
                     result.messagedata="userDescription field is required"
                     resolve(result)
                 }
             }else{
                 result.messagedata="userHeadline field is required"
             resolve(result)
             }
         })
             
    }
    updateData().then(function(resultdata){
        if(resultdata.message){
            res.json({
                "code": constant.success,
                "message" : constant.statusSucc,
              
            });
          
        }
        else{
            res.json({
                "code": constant.notFound,
                "message" : resultdata.message
                
            });        }
    }).catch(function(err){
        
        res.json({
            "code": constant.notFound,
            "message":"unexpected error" + err
        })
        return;
    })}
exports.emailverify = function(req,res,next){
    var dataObj ={}
    var result ={}
    dataObj.email = req.body.email;
    var checkEmail = (data)=> {
        return new Promise(function (resolve, reject){
            common.emailcheck(dataObj).then(function(dataValue){
               if (dataValue.code===true){
                        logger.info("email already exist");
                        result.message = "email exist"
                        resolve(result);
                    }
                    else{
                        logger.info("email does not exist");
                        result.datamessage = "email does not exist"
                        resolve(result);
                        
                    }
               })
        })
    }
    checkEmail().then(function(resultcheck){
        if(resultcheck.datamessage){
            res.json({
                "code": constant.success,
                "message" : resultcheck.datamessage
            });

        }else{
            res.json({
                "code": constant.notFound,
                "message" : resultcheck.message
            });
        }
    }).catch(function(err){
        res.json({
            "code": constant.fail,
            "message" : "unexpected error" + err
        });
    })

}

exports.education = function(req, res, next){
    console.log(">>>>>>>>>>>>")
    var dataObject ={}
    dataObject.country     = req.body.country,
    dataObject.degree  = req.body.degree,
    dataObject.startYear = req.body.startyear,
    dataObject.EndYear = req.body.endyear,
    dataObject.users = req.body.userId,
    dataObject.university = req.body.university
    dataObject.token = req.body.token
    console.log(dataObject.token);

  console.log("*************Education Saved *********************");

  console.log(dataObject);
  console.log("***************************************");


   // return;
    var addEductionData = (datac) => {
        console.log("/////")
    return new Promise(function (resolve, reject){
        console.log("/////")
        User.find({token:dataObject.token})
        .then(function(users){
            console.log(users)
            if(users[0].token) {
                console.log(users)
                var eduactionObj = new Education({
                    degree: req.body.degree,
                    country : dataObject.country,
                    startYear : dataObject.startYear,
                    EndYear : dataObject.EndYear,
                    university:dataObject.university
                    });
              
                    eduactionObj.save(function(err,educations) {
                    if (err) {
                        console.log("???????")
                        console.log(err)
                        reject(err)
                    } 
                    else {
                        console.log("+++++++++")
                        //console.log(educations)
                       // console.log("mmmmmmmmmmm",users[0].educations)
                    users[0].educations.push(educations._id);
                        console.log(users)
                    users[0].save(function(err, data){
                        console.log("??????????")
                        if(err){
                            console.log(">>>>>>>>>>>><<<<<<")
                            console.log(err)
                            reject(err)
                        }else{
                            educations.users.push(users[0]._id)
                            educations.save(function(err, data){
                                console.log(data)
                                console.log(";;;;;;;;;;;;;;;;;;;;")
                                console.log("data")
                                resolve(data)
                            })
                           
                        }
                    })
                   
                 }
                });
            }
            else{
                console.log("ccccccccccccccc")
                console.log(err)
                reject(err)
            }
        }).catch(function(err){
            console.log(err)
            reject(err)
        })
     }); 
};

addEductionData().then(function(resultcheck){
    res.json({
            "code": constant.success,
            "message" : constant.statusSucc
        });
}).catch(function(err){
    res.json({
        "code": constant.fail,
        "message" : "unexpected error" + err
    });
})

}
/*
exports.updateEducation = function(req, res, next)
{
   var dataObject = {}
   var result ={}
    dataObject.EducationId = req.body.EducationId;
    console.log(dataObject)
    var updateEductionData = (datac) => {
        console.log("?????")
        dataObject.degree =req.body.degree
        dataObject.country=req.body.country
        dataObject.startYear=req.body.startyear
        dataObject.university = req.body.university
        dataObject.EndYear=req.body.endyear
        return new Promise(function (resolve, reject){
            if(dataObject.degree){
                if(dataObject.country) {
                    if(dataObject.startYear) {  
                        if(dataObject.startYear) {
                            Education.find({EducationId:dataObject.EducationId}).then(function(datav){
                                if(datav){
                                    Education.update({EducationId:dataObject.EducationId}, { $set: { degree:dataObject.degree, country :dataObject.country, startYear : dataObject.startYear ,EndYear: dataObject.EndYear, university:dataObject.university} })
                                    .then(function(dataObj){
                                        console.log("ddddddddddddd", dataObj)
                                    if(dataObj.ok){
                                        result.message="successfully updated"
                                        resolve(result)
                                    }
                                    }).catch(function(err){
                                        reject(err)
                                    })
                                }else{
                                    result.messagedata="education id does not exist"
                                    resolve(result)
                                    
                                } 
                            })
                        }else{
                            result.messagedata="End Year field is required"
                        resolve(result)
                        }
                    }else{
                        result.messagedata="startYear field is required"
                        resolve(result)
                    }
                }else{
                    result.messagedata="country field is required"
                    resolve(result)
                } 
            }else{
                result.messagedata="degree field is required"
                    resolve(result)
            }
        })
    
    }
   
    updateEductionData().then(function(dataResult){    
        console.log("<<<<<<<<<<<<<<",dataResult )
        if(dataResult.message){
            res.json({
                "code": constant.success,
                "message" : dataResult.message
            });
        }
        else{
            res.json({
                "code": constant.notFound,
                "message" : dataResult.messagedata
            });
        }

    }).catch(function(err){
        console.log("MMMMMMMMMMMM", err)
        res.json({
            "code": constant.fail,
            "message" : "unexpected error" + err
        });
    })
}
*/
exports.updateEducation = function(req, res, next)
{
   var dataObject = {}
   var result ={}
    dataObject.EducationId = req.body.EducationId;
    console.log(dataObject)
    var updateEductionData = (datac) => {
        console.log("?????")
        dataObject.degree =req.body.degree
        dataObject.country=req.body.country
        dataObject.startYear=req.body.startyear
        dataObject.university = req.body.university
        dataObject.EndYear=req.body.endyear
        return new Promise(function (resolve, reject){
            if(dataObject.degree){
                if(dataObject.country) {
                    if(dataObject.startYear) {  
                        if(dataObject.startYear) {
                            Education.find({EducationId:dataObject.EducationId}).then(function(datav){
                                if(datav.length>0){
                                    Education.update({EducationId:dataObject.EducationId}, { $set: { degree:dataObject.degree, country :dataObject.country, startYear : dataObject.startYear ,EndYear: dataObject.EndYear, university:dataObject.university} })
                                    .then(function(dataObj){
                                        console.log("ddddddddddddd", dataObj)
                                    if(dataObj.ok){
                                        result.message="successfully updated"
                                        resolve(result)
                                    }
                                    else{
                                        result.messagedata="education updation failed"
                                        resolve(result)
                                    }
                                    }).catch(function(err){
                                        result.messagedata="education updation failed"
                                        resolve(result)
                                    })
                                }else{
                                    result.messagedata="education id does not exist"
                                    resolve(result)
                                    
                                } 
                            }).catch(function(err){
                                result.messagedata="education id does not exist"
                                    resolve(result)
                            })
                        }else{
                            result.messagedata="End Year field is required"
                        resolve(result)
                        }
                    }else{
                        result.messagedata="startYear field is required"
                        resolve(result)
                    }
                }else{
                    result.messagedata="country field is required"
                    resolve(result)
                } 
            }else{
                result.messagedata="degree field is required"
                    resolve(result)
            }
        })
    
    }
   
    updateEductionData().then(function(dataResult){    
        console.log("<<<<<<<<<<<<<<",dataResult )
        if(dataResult.message){
            res.json({
                "code": constant.success,
                "message" : dataResult.message
            });
        }
        else{
            res.json({
                "code": constant.notFound,
                "message" : dataResult.messagedata
            });
        }

    }).catch(function(err){
        console.log("MMMMMMMMMMMM", err)
        res.json({
            "code": constant.fail,
            "message" : "unexpected error" + err
        });
    })
}


exports.checkedu = function(req,res,next){
    var data ={}

    data.token = req.body.token
    User.find({token:data.token}).populate('educations') 
    .exec().then(function (education) {
        if(education){
            res.json({
                "code": constant.success,
                "message" : constant.statusSucc,
                "educations":education[0].educations
            });
        }
        else {
            res.json({
                "code": constant.fail,
                "message" : "unexpected error" + err
            });
        }
       

  });
}

exports.delEducation = function(req,res,next){
   Education.findOne({ EducationId: req.body.EducationId })
   .then(function(resultdata){
       console.log(resultdata)
       User.update({token:req.body.token},
           { "$pull": { "educations":resultdata._id } })
           .then(function(data){
               if(data.ok){
                   Education.deleteOne({EducationId: req.body.EducationId})
                   .then(function(dataval){
                       if(dataval.ok){
                           res.json({
                               "code": constant.success,
                               "message" : constant.del,
                           });
                       }
                       else{
                           res.json({
                               "code": constant.fail,
                               "message" : constant.errdel,
                           });
                       }
                   }).catch(function(err){
                       res.json({
                           "code": constant.notFound,
                           "message":"unexpected error" + err
                       })
                       return;
                   })
               }
               else{
                   res.json({
                       "code": constant.fail,
                       "message" : constant.errdel,
                   });
               }
           }).catch(function(err){
               res.json({
                   "code": constant.notFound,
                   "message":"unexpected error" + err
               })
               return;
           })
   }).catch(function(err){
       res.json({
           "code": constant.notFound,
           "message":"education not found"
       })
       return;
   })
}

exports.getprofile =function(req,res, next){
    var userProObj ={}
    var result ={}
  
    userProObj.token = req.params.token;
    console.log(userProObj)
    var updateData = (data)=> {
        return new Promise(function (resolve, reject){
            User.find({token:userProObj.token})
            .then(function(dataval){
                if(dataval){
                    result.username = dataval[0].username
                    result.email =dataval[0].email
                    result.mobileNo = dataval[0].mobileNo
                    result.dob =dataval[0].dob
                    result.gender =dataval[0].gender
                    result.city =dataval[0].city
                    result.country =dataval[0].country
                    result.state =dataval[0].state
                    result.address =dataval[0].address
                    result.pincode =dataval[0].pincode
                    result.userHeadline= dataval[0].userHeadline
                    result.userDescription =dataval[0].userDescription
                    resolve(result)
                }else{
                    result.message="user not found";
                    resolve(result)
                }
            })
        })
    }

    updateData().then(function(resultdata){
        if(resultdata.message){
            res.json({
                "code": constant.notFound,
                "message" : data.message
                
            });
        }
        else{
            res.json({
                "code": constant.success,
                "message" : constant.statusSucc,
                "data" : resultdata
            }); 

        }
    }).catch(function(err){
         
        res.json({
            "code": constant.notFound,
            "message":"unexpected error" + err
        })
        return;
    })

}

exports.countries = function(req, res, next){
   Country.aggregate([
        { $group: { _id: {  country: "$country" }, count: { $sum: 0 } } },
        ], function(err, results) {
            if(err){
                res.json({
                    "code": constant.notFound,
                    "message":"unexpected error" + err
                })
            }
        
            else 
                
            {   var arr = []
            results.forEach(function (value, i) {
                arr.push( { "country_name": value._id.country});
            });
            if(arr){
                    
                    res.json({
                    "code": constant.success,
                    "message" : arr
                }); 
            }
            else{
                res.json({
                    "code": constant.notFound,
                    "message":"unexpected error" 
                })

            }
         }
      });
}

exports.universties = function(req, res, next){
    var cityObj = {}
    cityObj.country = req.body.country;
    console.log(".....", cityObj)
    var cityData = (data)=> {
        return new Promise(function (resolve, reject){
            Country.find({country:cityObj.country})
            .then(function(dataval){
                if(dataval){
                    //console.log(dataval[0].name)
                    var arr = []
                    dataval.forEach(element => {
                        console.log(element.name)
                        arr.push({university_name:element.name})
                    });
                    
                   resolve(arr)
                }else{
                    result.message="university not found";
                    resolve(result)
                }
            })
        })
    }

    cityData().then(function(resultdata){
        console.log(resultdata)
        if(resultdata.message){
            res.json({
                "code": constant.notFound,
                "message" : data.message
            }); 
           
        }
        else{
            res.json({
                "code": constant.success,
                "message" : resultdata
            });

        }
    }).catch(function(err){
         
        res.json({
            "code": constant.notFound,
            "message":"unexpected error" + err
        })
        return;
    })
}
exports.addExperience = function(req, res, next){
    var dataObject ={}
    var result ={}
    dataObject.title     = req.body.title,
    dataObject.company  = req.body.company,
    dataObject.timePeriod = req.body.timeperiod,
    dataObject.startYear = req.body.startyear,
    dataObject.endMonth = req.body.endmonth,
    dataObject.endYear = req.body.endyear,
    dataObject.summary = req.body.summary,
    dataObject.token = req.body.token
    console.log(dataObject);
   // return;
    var addExperienceData = (datac) => {
    return new Promise(function (resolve, reject){
        if(dataObject.token==="" || null){
            result.message = "token value is null"
                resolve(result)
        }else{
        User.find({token:dataObject.token})
        .then(function(users){
            console.log(users)
            if(users.length>0) {
                console.log(users)
                if(dataObject.company){
                    var experienceObj = new Experience({
                        title: dataObject.title,
                        company : dataObject.company,
                        timePeriod : dataObject.timePeriod,
                        startYear : dataObject.startYear,
                        endMonth:dataObject.endMonth,
                        endYear :dataObject.endYear,
                        summary:dataObject.summary                        });
                
                        experienceObj.save(function(err,experience) {
                        if (err) {
                            logger.error("check error",err)
                            reject(err)
                        }
                        else {
                        users[0].experiences.push(experience._id);
                            console.log(users)
                        users[0].save(function(err, data){
                            if(err){
                                console.log(err)
                                reject(err)
                            }else{
                                experience.users.push(users[0]._id)
                                experience.save(function(err, data){
                                    console.log(data)
                                    resolve(data)
                                })
                            
                            }
                        })
                    
                    }
                    });
                }else{
                    result.message = "comapany name is required"
                    resolve(result)
                }  
            }
            else{
                result.message = "token is not valid"
                resolve(result)
            }
        }).catch(function(err){
            logger.error("unexpected error", err)
            result.message = "token is not valid"
            resolve(result)
        })
    }
     });
 };
 addExperienceData().then(function(resultcheck){
    if(resultcheck.message){
        res.json({
        "code": constant.notFound,
        "message" : resultcheck.message
        })
    }else{
    res.json({
            "code": constant.success,
            "message" : constant.statusSucc
        });
    }
 }).catch(function(err){
    res.json({
        "code": constant.fail,
        "message" : "unexpected error" + err
    });
 })
 }






/*
exports.addExperience = function(req, res, next){
    var dataObject ={}
    var result ={}
    dataObject.title     = req.body.title,
    dataObject.company  = req.body.company,
    dataObject.timePeriod = req.body.timePeriod,
    dataObject.startYear = req.body.startYear,
    dataObject.endMonth = req.body.endMonth,
    dataObject.endYear = req.body.endYear,
    dataObject.summary = req.body.summary,
    dataObject.token = req.body.token
    console.log(dataObject.token);
   // return;
    var addExperienceData = (datac) => {
    return new Promise(function (resolve, reject){
        User.find({token:dataObject.token})
        .then(function(users){
            console.log(users)
            if(users[0].token) {
                console.log(users)
                if(dataObject.company){
                    var experienceObj = new Experience({
                        title: dataObject.title,
                        company : dataObject.company,
                        timePeriod : dataObject.timePeriod,
                        startYear : dataObject.startYear,
                        endMonth:dataObject.endMonth,
                        endYear :dataObject.endYear,
                        summary:dataObject.summary

                        });
                
                        experienceObj.save(function(err,experience) {
                        if (err) {
                            logger.error("check error",err)
                            reject(err)
                        } 
                        else {
                        users[0].experiences.push(experience._id);
                            console.log(users)
                        users[0].save(function(err, data){
                            if(err){
                                console.log(err)
                                reject(err)
                            }else{
                                experience.users.push(users[0]._id)
                                experience.save(function(err, data){
                                    console.log(data)
                                    resolve(data)
                                })
                            
                            }
                        })
                    
                    }
                    });
                }else{
                    result.message = "comapany name is required"
                    resolve(result)
                }   
            }
            else{
                logger.error("user not found", err)
                reject(err)
            }
        }).catch(function(err){
            logger.error("unexpected error", err)
            reject(err)
        })
     }); 
};


addExperienceData().then(function(resultcheck){
    if(resultcheck.message){
        res.json({
        "code": constant.notFound,
        "message" : resultcheck.message
        })
    }else{
    res.json({
            "code": constant.success,
            "message" : constant.statusSucc
        });
    }
}).catch(function(err){
    res.json({
        "code": constant.fail,
        "message" : "unexpected error" + err
    });
})
}
*/

exports.delToken = function(req, res, next){
     var userObj = {}
     userObj.email = req.body.email;
     if(userObj.email)
     {
     common.emailcheck(userObj)
        .then(function(dataObj){
            console.log(dataObj)
            if(dataObj.code === true){
                User.update({email:userObj.email}, { $set: { token:""} })
                .then(function(dataval){
                    if(dataval.ok){
                        res.json({
                            "code": constant.success,
                            "message" : constant.logout,
                        });
                    }
                    else{
                        res.json({
                            "code": constant.fail,
                            "message" : constant.errdel,
                        });
                    }
                }).catch(function(err){
                    res.json({
                        "code": constant.notFound,
                        "message":"unexpected error" + err
                    })
                    return;
                }) 
            }
        }).catch(function(err){
            res.json({
                "code": constant.notFound,
                "message":"unexpected error" + err
            })
            return;
        })
    }else{
        res.json({
            "code": constant.notFound,
            "message":"email is not provided"
        })
        return;

    }
}

exports.getExp = function(req,res,next){
    var data ={}
    data.token = req.body.token
    User.find({token:data.token}).populate('experiences') 
    .exec().then(function (experience) {
        if(experience){
            res.json({
                "code": constant.success,
                "message" : constant.statusSucc,
                "educations":experience[0].experiences
            });
        }
        else {
            res.json({
                "code": constant.fail,
                "message" : "unexpected error" + err
            });
        }
       

  });
}
/*
exports.updateExperience = function(req, res, next)
{
   var dataObject = {}
   var result ={}
    dataObject.ExperienceId = req.body.ExperienceId;
    console.log(dataObject)
    var updateExperienceData = (datac) => {
       
        console.log("?????")
        dataObject.title =req.body.title
        dataObject.company=req.body.company
        dataObject.timePeriod=req.body.timePeriod
        dataObject.startYear = req.body.startYear
        dataObject.endMonth=req.body.endMonth
        dataObject.endYear=req.body.endYear
        dataObject.summary = req.body.summary
        
        return new Promise(function (resolve, reject){
             if(dataObject.ExperienceId){
            if(dataObject.company){
                if(dataObject.title) {
                    if(dataObject.timePeriod) {  
                        if(dataObject.startYear) {
                            if(dataObject.endMonth) {  
                                    if(dataObject.endYear) {
                                    Experience.find({ExperienceId:dataObject.ExperienceId}).then(function(datav){
                                    if(datav){
                                        Experience.update({ExperienceId:dataObject.ExperienceId}, { $set: { title:dataObject.title, company :dataObject.company, timePeriod : dataObject.timePeriod ,endMonth:  dataObject.endMonth, endYear: dataObject.endYear,summary: dataObject.summary} })
                                        .then(function(dataObj){
                                            console.log("ddddddddddddd", dataObj)
                                        if(dataObj.n===1){
                                            result.message="successfully updated"
                                            resolve(result)
                                        }
                                        }).catch(function(err){
                                            reject(err)
                                        })
                                    }else{
                                        result.messagedata="experience id does not exist"
                                        resolve(result)
                                        
                                    } 
                                })
                            }else{
                                result.messagedata="end Year field is required"
                                resolve(result)
                        }
                        }else{
                            result.messagedata="end month field is required"
                            resolve(result)
                        }
                    }else{ result.messagedata="Start Year field is required"
                    resolve(result)
                        
                    }
                }else{
                    result.messagedata="time Period field is required"
                    resolve(result)
                } 
            }else{
                result.messagedata="title field is required"
                resolve(result)
            }
        }else{
            result.messagedata="company field is required"
            resolve(result)
        }
    }else{
        result.messagedata="experience id does not exist"
        resolve(result)
        
    } 
        })
   
    }
   
    updateExperienceData().then(function(dataResult){    
        console.log("<<<<<<<<<<<<<<",dataResult )
        if(dataResult.message){
            res.json({
                "code": constant.success,
                "message" : dataResult.message
            });
        }
        else{
            res.json({
                "code": constant.notFound,
                "message" : dataResult.messagedata
            });
        }

    }).catch(function(err){
        console.log("MMMMMMMMMMMM", err)
        res.json({
            "code": constant.fail,
            "message" : "unexpected error" + err
        });
    })
}
*/

exports.updateExperience = function(req, res, next)
{
   var dataObject = {}
   var result ={}
    dataObject.ExperienceId = req.body.ExperienceId;
    console.log(dataObject)
    var updateExperienceData = (datac) => {
       
        console.log("?????")
        dataObject.title =req.body.title
        dataObject.company=req.body.company
        dataObject.timePeriod=req.body.timeperiod
        dataObject.startYear = req.body.startyear
        dataObject.endMonth=req.body.endmonth
        dataObject.endYear=req.body.endyear
        dataObject.summary = req.body.summary
        
        return new Promise(function (resolve, reject){
             if(dataObject.ExperienceId){
            if(dataObject.company){
                if(dataObject.title) {
                    if(dataObject.timePeriod) {  
                        if(dataObject.startYear) {
                            if(dataObject.endMonth) {  
                                    if(dataObject.endYear) {
                                    Experience.find({ExperienceId:dataObject.ExperienceId}).then(function(datav){
                                    if(datav){
                                        Experience.update({ExperienceId:dataObject.ExperienceId}, { $set: { title:dataObject.title, company :dataObject.company, timePeriod : dataObject.timePeriod ,endMonth:  dataObject.endMonth, endYear: dataObject.endYear,summary: dataObject.summary} })
                                        .then(function(dataObj){
                                            console.log("ddddddddddddd", dataObj)
                                        if(dataObj.n===1){
                                            result.message="successfully updated"
                                            resolve(result)
                                        }
                                        }).catch(function(err){
                                            reject(err)
                                        })
                                    }else{
                                        result.messagedata="experience id does not exist"
                                        resolve(result)
                                        
                                    } 
                                })
                            }else{
                                result.messagedata="end Year field is required"
                                resolve(result)
                        }
                        }else{
                            result.messagedata="end month field is required"
                            resolve(result)
                        }
                    }else{ result.messagedata="Start Year field is required"
                    resolve(result)
                        
                    }
                }else{
                    result.messagedata="time Period field is required"
                    resolve(result)
                } 
            }else{
                result.messagedata="title field is required"
                resolve(result)
            }
        }else{
            result.messagedata="company field is required"
            resolve(result)
        }
    }else{
        result.messagedata="experience id does not exist"
        resolve(result)
        
    } 
        })
   
    }
   
    updateExperienceData().then(function(dataResult){    
        console.log("<<<<<<<<<<<<<<",dataResult )
        if(dataResult.message){
            res.json({
                "code": constant.success,
                "message" : dataResult.message
            });
        }
        else{
            res.json({
                "code": constant.notFound,
                "message" : dataResult.messagedata
            });
        }

    }).catch(function(err){
        console.log("MMMMMMMMMMMM", err)
        res.json({
            "code": constant.fail,
            "message" : "unexpected error" + err
        });
    })
}




exports.delExperience= function(req,res,next){
	if(req.body.ExperienceId){
		if(req.body.token){
		Experience.findOne({ ExperienceId: req.body.ExperienceId })
		.then(function(resultdata){
			console.log(resultdata)
			console.log(resultdata._id)
		User.update({token:req.body.token},
				{ "$pull": { "experiences":resultdata._id } })
				.then(function(data){
					console.log("//////", data)
					if(data.nModified===1){
						Experience.deleteOne({ExperienceId: req.body.ExperienceId})
						.then(function(dataval){
							if(dataval.ok){
								res.json({
									"code": constant.success,
									"message" : constant.del,
								});
							}
							else{
								res.json({
									"code": constant.fail,
									"message" : constant.errdel,
								});
							}
						}).catch(function(err){
							res.json({
								"code": constant.notFound,
								"message":"unexpected error" + err
							})
							return;
						})
					}
					else{
						res.json({
							"code": constant.fail,
							"message" : constant.errdel,
						});
					}
				}).catch(function(err){
					res.json({
						"code": constant.notFound,
						"message":"unexpected error" + err
					})
					return;
				})
		}).catch(function(err){
			res.json({
				"code": constant.notFound,
				"message":"experience not found" 
			})
			return;
		})
	}else{
		res.json({
			"code": constant.notFound,
			"message":"token not found" 
		})
	
	}
	}else{
		res.json({
			"code": constant.notFound,
			"message":"experience id not found" 
		})
	
	}
}




/*
exports.delExperience= function(req,res,next){
    Experience.findOne({ ExperienceId: req.body.ExperienceId })
    .then(function(resultdata){
        console.log(resultdata)
        User.update(
            { "$pull": { "experiences":resultdata._id } })
            .then(function(data){
                console.log("//////", data)
                if(data.n===1){
                   /*  Experience.deleteOne({ExperienceId: req.body.ExperienceId})
                    .then(function(dataval){
                        if(dataval.ok){
                            res.json({
                                "code": constant.success,
                                "message" : constant.del,
                            });
                        }
                        else{
                            res.json({
                                "code": constant.fail,
                                "message" : constant.errdel,
                            });
                        }
                    }).catch(function(err){
                        res.json({
                            "code": constant.notFound,
                            "message":"unexpected error" + err
                        })
                        return;
                    }) 
                }
                else{
                    res.json({
                        "code": constant.fail,
                        "message" : constant.errdel,
                    });
                }
            }).catch(function(err){
                res.json({
                    "code": constant.notFound,
                    "message":"unexpected error" + err
                })
                return;
            })
    }).catch(function(err){
        res.json({
            "code": constant.notFound,
            "message":"experience not found" 
        })
        return;
    })
}
*/

exports.getSingleEducation = function(req,res,next){
   var eduObject = {}
   var result ={}
   eduObject.EducationId= req.body.EducationId
   Education.find({EducationId:eduObject.EducationId}).then(function(datav){
       if(datav.length>0){
           console.log(datav)
          result.university= datav[0].university
          result.country= datav[0].country
          result.degree=datav[0].degree
          result.startYear=datav[0].startYear
          result.EndYear=datav[0].EndYear,
           result.EducationId=datav[0].EducationId,
          console.log(result)
           res.json({
               "code": constant.success,
               "message" :constant.statusSucc,
               "data": result
           });
         
           console.log(datav)
       }else{
           res.json({
               "code": constant.notFound,
               "message":"education id does not exist"
           })
       }
   }).catch(function(err){
       res.json({
           "code": constant.notFound,
           "message":"education id does not exist"  
       })
   })

}



exports.getSingleExp = function(req, res, next){
    var eduObject = {}
    var result ={}
    eduObject.ExperienceId= req.body.ExperienceId
    Experience.find({ExperienceId:eduObject.ExperienceId}).then(function(datav){
        if(datav.length>0){
            console.log(datav)
           result.title= datav[0].title 
           result.company= datav[0].company
           result.timePeriod=datav[0].timePeriod
           result.startYear=datav[0].startYear
           result.endMonth=datav[0].endMonth
           result.endYear=datav[0].endYear
           result.summary=datav[0].summary
           result.ExperienceId=datav[0].ExperienceId
           console.log(result)
            res.json({
                "code": constant.success,
                "message" :constant.statusSucc,
                "data": result
            });
           
            console.log(datav)
        }else{
            res.json({
                "code": constant.notFound,
                "message":"experience id does not exist" 
            })
        } 
    }).catch(function(err){
        res.json({
            "code": constant.notFound,
            "message":"experience id does not exist"  
        })
    })

}
