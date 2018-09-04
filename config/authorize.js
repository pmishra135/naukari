var auth = require('./auth');
    
export var authorize = (username,password,callback)=> {
    if(username == auth.username && password == auth.password){
        return callback(null,true);
    }else{
        return callback(null,false);
    }
}

export var getUnauthorizedResponse = (req)=>{
    return req.auth ?
    ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected') :
        'No credentials provided'
} 