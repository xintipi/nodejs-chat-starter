var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var helper = require('./utils/helper');
var routes = require('./routes/index');

var app = express();
app.locals.moment = require('moment');
// call socket.io to the app
app.io = require('socket.io')();

app.io.use(function(socket, next) {
    let userID = socket.request._query['userId'];
    let userSocketId = socket.id;
    const data = {
        id : userID,
        value : {
            $set :{
                socketId : userSocketId,
                online : 'Y'
            }
        }
    };
    helper.addSocketId( data ,(error,response)=>{
        next();
    });
});

app.io.on('connection', (socket) => {
    /**
     * get the user's Chat list
     */
    socket.on('chat-list', (data) => {

        let chatListResponse = {};
        if (data.userId == '') {
            chatListResponse.error = true;
            chatListResponse.message = `User does not exits.`;
            app.io.emit('chat-list-response',chatListResponse);
        }else{
            helper.getUserInfo( data.userId,(err, UserInfoResponse)=>{

                delete UserInfoResponse.password;
                delete UserInfoResponse.timestamp;
                helper.getChatList(data.userId, (err, response)=>{

                    app.io.to(socket.id).emit('chat-list-response',{
                        error : false ,
                        singleUser : false ,
                        chatList : response === null ? null : response.users
                    });
                    if (response !== null) {
                        let chatListIds = response.socketIds;
                        chatListIds.forEach( (Ids)=>{
                            app.io.to(Ids.socketId).emit('chat-list-response',{
                                error : false ,
                                singleUser : true ,
                                chatList : UserInfoResponse
                            });
                        });
                    }
                });
            });
        }
    });
    /**
     * send the messages to the user
     */
    socket.on('add-message', (data) => {

        if (data.message === '') {
            app.io.to(socket.id).emit('add-message-response','Message cant be empty');
        }else if(data.fromUserId === ''){
            app.io.to(socket.id).emit('add-message-response','Unexpected error, Login again.');
        }else if(data.toUserId === ''){
            app.io.to(socket.id).emit('add-message-response','Select a user to chat.');
        }else{
            let toSocketId = data.toSocketId;
            let fromSocketId = data.fromSocketId;

            data.timestamp = Math.floor(new Date() / 1000);
            helper.insertMessages(data,( error , response)=>{
                app.io.to(toSocketId).emit('add-message-response',data);
            });
        }
    });

    /**
     * Logout the user
     */
    // socket.on('logout',(data)=>{
    //     const userId = data.userId;
    //     helper.logout(userId , (error, result)=>{
    //         app.io.to(socket.id).emit('logout-response',{
    //             error : false,
    //         });
    //         socket.disconnect();
    //     });
    // });
    /**
     * sending the disconnected user to all socket users.
     */
    socket.on('disconnect',()=>{
        setTimeout(()=>{
            helper.isUserLoggedOut(socket.id,(response)=>{
                if (response.loggedOut) {
                    socket.broadcast.emit('chat-list-response',{
                        error : false ,
                        userDisconnected : true ,
                        socketId : socket.id,
                    });
                }
            });
        },1000);
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'mysuppersecret',
    resave: false,
    saveUninitialized: false,
}));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
