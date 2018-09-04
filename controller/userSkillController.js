var express = require('express');
var router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
let Skill = require('../model/skill.js');
let User = require('../model/user.js');
const bcrypt = require('bcrypt-nodejs');
var mongoose = require("mongoose");
var constant = require('../utils/constant.js')
const logger = require('../utils/logger').logger;
var common = require('../utils/common')


exports.skills = function(req, res, next){
var SkillObj=  req.body.SkillName;
   if(Array.isArray(req.body.SkillName)=== true){
        var arr =[]
            SkillObj.forEach(element => {
            arr.push({skillName: element})
            });
                Skill.insertMany(arr).then((docs) => {
                    if(docs){
                        res.json({
                            "code": constant.success,
                            "message": constant.statusSucc
                        }); 
                    }
                    else{
                        res.json({
                            "code": constant.notFound,
                            "message": constant.insertionDB
                        }); 

                    }
                }).catch((err) => {
                    res.json({
                        "code"   :  constant.fail,
                        "message":  constant.insertionDB + err.message
                    });
                })
    }else{
       var skilldata = new Skill({
                skillName     : SkillObj,
             });
             skilldata.save().then(function(data){
                if(data){
                    res.json({
                        "code": constant.success,
                        "message": constant.statusSucc
                    }); 
                }
                else{
                    res.json({
                        "code": constant.notFound,
                        "message": constant.insertionDB
                    }); 

                }
             }).catch(function(err){
                res.json({
                    "code"   :  constant.fail,
                    "message":  constant.insertionDB + err.message
                });
             })
    }
    
} 


exports.getSkills = function(req, res, next){
    var dataObj = {}
    dataObj.token = req.params.token
    User.find({token:dataObj.token})
        .then(function(dataRes){
            if(dataRes){
                Skill.find()
                    .then(function(dataval){
                        if(dataval){
                            var arr = []
                            dataval.forEach(element => {
                                arr.push({skill :element.skillName, id :element._id })
                            });
                            if(arr){
                                res.json({
                                    "code": constant.success,
                                    "message": constant.statusSucc,
                                    "data": arr
                                }); 
                            }else{
                                res.json({
                                    "code": constant.notFound,
                                    "message": constant.NF
                                });
                            }
                        }
                        else{
                            res.json({
                                "code": constant.notFound,
                                "message": constant.NF
                            }); 
                            
                        }
                    }).catch(function(resultData){
                        res.json({
                            "code"   :  constant.fail,
                            "message":  constant.insertionDB + err.message
                        });
                    })
            }
            else{
                res.json({
                    "code": constant.notFound,
                    "message": constant.exitUser
                }); 
                
            }
        }).catch(function(resultData){
            res.json({
                "code"   :  constant.fail,
                "message":  constant.insertionDB + err.message
            });
        })
    
}

exports.addSkillUser = function(req,res,next){
    var dataObject ={}
    var result ={}
    dataObject.skills = req.body.ids.split(','),

    dataObject.token = req.body.token
    console.log(dataObject.skills);
   var addEductionData = (datac) => {
    return new Promise(function (resolve, reject){
        User.find({token:dataObject.token})
        .then(function(users){
            //console.log(users)
            if(users[0].token) {
             /* User.find({
                skills: {
                    $elemMatch: dataObject.skills
                }
            }).then(function( docs) {

                console.log(docs);
                // res.send(docs)
            }).catch(function(err){
                console.log(err)
            }); */
            var val =dataObject.skills
            var arr=[]
            val.forEach(element => {
                    users[0].skills.push(element)
                });
                console.log(users[0])
                users[0].save(function(err,data){
                    resolve(data)
                })
            }
            else{
                result.message= constant.exitUser
               resolve(result)
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