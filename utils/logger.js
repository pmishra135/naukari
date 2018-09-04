const winston = require ('winston');
const fs = require ('fs');
var logDirectory = './logs';

winston.setLevels( winston.config.npm.levels );
winston.addColors( winston.config.npm.colors );

if ( !fs.existsSync( logDirectory ) ) {
 // Create the directory if it does not exist
 fs.mkdirSync( logDirectory );
}

module.exports.logger = new( winston.Logger )( {
 transports: [
    new winston.transports.Console( {
     level: 'info', 
     colorize: true
   } ),
  new winston.transports.File( {
     level: 'info',
     timestamp : function(){ return Date()},
     filename: logDirectory + '/hvpl.log',
     handleExceptions: true,
     json: true
  })
    ] 
});