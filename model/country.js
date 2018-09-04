var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
//var connection = mongoose.Connection("mongodb://localhost/hvpl");


var countrySchema = new Schema({
    web_pages :[{type:String}],
    name:{type:String},
    alpha_two_code:{type:String},
    domains:[{type:String}],
    country:{type:String}

});
 
module.exports = mongoose.model('Country', countrySchema);