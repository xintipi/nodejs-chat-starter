var helper = require('../utils/helper');

var checkHome = function (request, response) {
    let userId = request.params.userId;
    if (userId == '') {
        response.redirect('/');
    }else{
        helper.userSessionCheck( {
            userId : userId,
        }, (error,result)=>{
            if (error || result === null) {
                response.redirect('/');
            }else{
                response.render('home');
            }
        });
    }
};

var usernameCheck = function (request, response) {
    if (request.body.username === "") {
        response.json({
            error : true,
            message : `username cant be empty.`
        });
    } else {
        helper.userNameCheck( {
            username : request.body.username.toLowerCase()
        }, (count)=>{

            let result = {};

            if (count > 0) {
                result.error = true;
                result.message = 'This username is alreday taken.';
                response.json(result);
            } else {
                result.error = false;
                result.message = 'This username is available.';
                response.json(result);
            }
        });
    }
};
var getMessages = function (request, response) {
    let userId = request.body.userId;
    let toUserId = request.body.toUserId;
    let messages = {};

    if (userId == '') {
        messages.error = true;
        messages.message = `userId cant be empty.`;
        response.status(200).json(messages);
    }else{

        helper.getMessages( userId, toUserId, (error,result)=>{

            if (error) {

                messages.error = true;
                messages.message = `Server error.`;
                response.status(200).json(messages);

            }else{

                messages.error = false;
                messages.messages = result;
                response.status(200).json(messages);
            }
        });
    }
};

var registerUser = function (request, response) {
    const data = {
        username : (request.body.username).toLowerCase(),
        password : request.body.password
    };

    let registrationResponse = {};

    if(data.username === '') {

        registrationResponse.error = true;
        registrationResponse.message = `username cant be empty.`;
        response.json(registrationResponse);

    }else if(data.password === ''){

        registrationResponse.error = true;
        registrationResponse.message = `password cant be empty.`;
        response.json(registrationResponse);

    }else{

        data.timestamp = Math.floor(new Date() / 1000);
        data.online = 'Y' ;
        data.socketId = '' ;

        helper.registerUser( data, (error,result)=>{

            if (error) {

                registrationResponse.error = true;
                registrationResponse.message = `User registration unsuccessful,try after some time.`;
                response.json(registrationResponse);
            }else{

                registrationResponse.error = false;
                registrationResponse.userId = result.insertedId;
                registrationResponse.message = `User registration successful.`;
                response.json(registrationResponse);
            }
        });
    }
};

var login = function (request, response) {
    var sessionInfo = request.session;
    const data = {
        username : (request.body.username).toLowerCase(),
        password : request.body.password
    };

    let loginResponse = {};

    if(data.username === '' || data.username === null) {

        loginResponse.error = true;
        loginResponse.message = `username cant be empty.`;
        response.json(loginResponse);

    }else if(data.password === '' || data.password === null){

        loginResponse.error = true;
        loginResponse.message = `password cant be empty.`;
        response.json(loginResponse);

    }else{

        helper.login( data, (error,result)=>{

            if (error || result === null) {

                loginResponse.error = true;
                loginResponse.message = `Invalid username and password combination.`;
                response.json(loginResponse);
            }else{
                loginResponse.error = false;
                loginResponse.userId = result._id;
                sessionInfo.Userid = result._id;
                loginResponse.message = `User logged in.`;
                response.json(loginResponse);
            }
        });
    }
};
var userSessionCheck = function (request, response) {
    let userId = request.body.userId;
    let sessionCheckResponse = {};

    if (userId == '') {

        sessionCheckResponse.error = true;
        sessionCheckResponse.message = `User Id cant be empty.`;
        response.status(412).json(sessionCheckResponse);

    }else{

        helper.userSessionCheck( {
            userId : userId,
        }, (error,result)=>{

            if (error || result === null) {

                sessionCheckResponse.error = true;
                sessionCheckResponse.message = `User is not logged in.`;
                response.status(401).json(sessionCheckResponse);
            }else{

                sessionCheckResponse.error = false;
                sessionCheckResponse.username = result.username;
                sessionCheckResponse.message = `User logged in.`;
                response.status(200).json(sessionCheckResponse);
            }
        });
    }
};

var logout = function (request, response) {
  var sessionInfo = request.session;
  if (sessionInfo.Userid){
      var userId = sessionInfo.Userid;
      helper.logout(userId, function (err, result) {
          if(err) {
              return response.json(err);
          } else {
              delete sessionInfo.Userid;
              response.redirect('/');
          }
      })
  }
};
exports.getMessages = getMessages;
exports.logout = logout;
exports.checkHome = checkHome;
exports.usernameCheck = usernameCheck;
exports.registerUser = registerUser;
exports.login = login;
exports.userSessionCheck = userSessionCheck;