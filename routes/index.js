var express = require('express');
var router = express.Router();
var user = require('../controller/user');

/* GET home page. */
router.get('/', function(req, res, next) {
    var sessionInfo = req.session;
    /*Render Login page If session is not set*/
    if(sessionInfo.Userid){
        res.redirect('/home/'+sessionInfo.Userid);
    }else{
        res.render('index', { title: 'Chat Application - Index' });
    }
    res.render('index', { title: 'Chat Application - Index' });
});

router.post('/getMessages', function (request, response) {
    user.getMessages(request, response);
});

router.get('/logout', function (request,response) {
    user.logout(request,response);
});

router.get('/home/:userId', (request,response) => {
    user.checkHome(request,response);
});

router.post('/usernameCheck',(request,response) =>{
    user.usernameCheck(request, response);
});

router.post('/registerUser',(request,response) =>{
    user.registerUser(request, response);
});

router.post('/login',(request,response) =>{
    user.login(request, response);
});

router.post('/userSessionCheck',(request,response) =>{
    user.userSessionCheck(request, response)
});

module.exports = router;
