var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SkillSchema = new Schema({
    skillName: {type: String },
    position: {type: Number},
    published:{type:Number, default : 0},
    created_at: Date,
    updated_at: {type: Date, default: Date.now},
    
});

module.exports = mongoose.model('Skill', SkillSchema);
