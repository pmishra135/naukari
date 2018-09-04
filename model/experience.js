var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/hvpl");
var User = require('./user.js');
autoIncrement.initialize(connection);

var ExperienceSchema = new Schema({
   ExperienceId :{type:String},
   title:{type:String},
   company :  {type:String,required:true,},
   timePeriod: {type: String},
   startYear: {type: Number},
   endMonth: {type: String},
   endYear: {type: Number},
   summary: {type: String},
   users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
   
});

module.exports = mongoose.model('Experience', ExperienceSchema);
ExperienceSchema.plugin(autoIncrement.plugin, {
    model: 'Experience',
    field: 'ExperienceId',
    startAt: 1,
    incrementBy: 1
  });   