var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');
var bcrypt = require('bcrypt-nodejs');
var connection = mongoose.createConnection("mongodb://localhost/hvpl");
var Education = require('./userEducation.js');
let Skill = require('./skill.js');
let Experience = require('./experience.js');
autoIncrement.initialize(connection);

var UserSchema = new Schema({
    userId :  {type:Number, },
    username: {type: String,  required:true, },
    email: {type: String, required:true, index: {unique:true},match: /.+@.+\..+/,lowercase : true},
    password: {type: String, required:true},
    mobileNo: {type: Number},
    dob: {type: Number},
    gender:{type: String},
    roll: {type: String},
    lastActivity:{type: Date, default: Date.now},
    created_at: Date,
    isActive: Boolean,
    updated_at: {type: Date, default: Date.now},
    userType:{type:String},
    city:{type:String},
    country:{type:String},
    state:{type:String},
    address:{type:String},
    pincode:{type: Number, max:7},
    socialId:{type:String},
    image:{type:String},
    token:{type:String},
    price:{type:Number, default : 0},
    currencyType :{type: String, default: "INR"},
    userHeadline :{type:String},
    userDescription : {type: String},
    educations: [{ type: Schema.Types.ObjectId, ref: 'Education' }],
    skills:[{type: Schema.Types.ObjectId, ref: 'Skill'}],
    experiences: [{ type: Schema.Types.ObjectId, ref: 'Experience' }]
});
 
UserSchema.pre('save',function(next){
    var user = this;
    if(!user.isModified('password'))
        return next();
    bcrypt.hash(user.password,null,null,function(err,hash){
        if(err)
            return next(err);
        user.password = hash;
        next();
    });
});

module.exports = mongoose.model('User', UserSchema);
UserSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'userId',
    startAt: 1,
    incrementBy: 1
  });