var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/hvpl");
var User = require('./user.js');
autoIncrement.initialize(connection);

var EducationSchema = new Schema({
    EducationId :{type:String},
    university:{type:String},
    country :  {type:String, },
    degree: {type: String,  required:true, },
    startYear: {type: String},
    EndYear: {type: String},
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    
});
 

module.exports = mongoose.model('Education', EducationSchema);
EducationSchema.plugin(autoIncrement.plugin, {
    model: 'Education',
    field: 'EducationId',
    startAt: 1,
    incrementBy: 1
  });   