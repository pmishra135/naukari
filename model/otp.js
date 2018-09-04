var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
//var connection = mongoose.Connection("mongodb://localhost/hvpl");


var OTPSchema = new Schema({
    email: {type: String, required:true},
    otp :{type: Number},
    created_at: { type: Date, default:Date.now, expires: 36000 },
    isActive: String,
    type: {type: String},
});
 
module.exports = mongoose.model('OTP', OTPSchema);
