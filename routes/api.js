var express = require('express');
var router = express.Router();
let userController = require('../controller/userController');
let userSkillController = require('../controller/userSkillController');
let basicController = require('../controller/basicController.js')
var secretKey = require('../config/auth').secretKey;
const jsonwebtoken = require('jsonwebtoken');
// Routes

router.get('/', userController.Index);
router.post('/reg', userController.register)
router.post('/login', userController.signin)
router.post('/reset', userController.resetPass)  
router.get('/data', userController.allUser)
//router.post('/check', userController.checkData)
router.post('/forgetpass', userController.forgetpwd)
router.post('/verifyOtp',userController.verifyotp)
router.post('/upload',isLoggedIn, userController.uploadFile)
//router.post('/updateProfile',isLoggedIn,  userController.updateprofile)
router.post('/updateProfile',  userController.updateprofile);
router.post("/getProfileData", userController.getProfileData);
router.post('/emailVerify',userController.emailverify)
router.post('/addEducation', userController.education)
router.post('/updateEducation',userController.updateEducation)
router.post("/getEducation", userController.checkedu)
router.post("/delEducation", userController.delEducation);
router.post('/getSingleEducation', userController.getSingleEducation)
router.get("/getUser/:token",isLoggedIn, userController.getprofile)
router.get("/getCountry", userController.countries)
router.post('/getUniversity', userController.universties)
router.post('/addSkill',isLoggedIn, userSkillController.skills)
router.get('/getSkill/:token',isLoggedIn,userSkillController.getSkills)
router.post('/addSkillbyUser',isLoggedIn, userSkillController.addSkillUser)
router.post('/logout',isLoggedIn, userController.delToken)
router.post('/addExperience', userController.addExperience)
router.post('/updateExperience', userController.updateExperience)
router.post("/getExperience", userController.getExp)
router.post("/delExperience", userController.delExperience);
router.post("/getSingleExperience", userController.getSingleExp)

function isLoggedIn(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.headers['x-access-token'];
    console.log(token)
   
// decode token
    if (token) {
        // verifies secret and checks exp
        jsonwebtoken.verify(token, secretKey, function(err, decoded) {
            if (err) {
                return  res.json({
                    "code": "404",
                    "message" : "sign in to continue",
                    });
            } else {
                // if everything is good, save to request for use in other routes
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return  res.json({
            "code": "404",
            "message" : "sign in to continue",
            });
    }
}


module.exports = router;


    