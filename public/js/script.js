'use strict';

const app = angular.module('app',[]);

app.factory('socket', function ($rootScope) {
    let socket = null;
    return {
        connect: function(userId){
            socket = io.connect({query: `userId=${userId}`});
        },
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});


app.service('appService',  function (socket,$http) {
    return new AppService($http);
});

app.controller('app',  function ($scope,$timeout,socket,appService) {

    $scope.UI = {
        isUsernameAvailable : true,
        typingTimer : null
    };

    $scope.form = {
        username : null,
        password : null,
        isUsernameSuggest : null,
        registerPassword:null
    };

    var typingTimer =  null;

    $scope.usernameCheck = function(){
        $timeout.cancel($scope.UI.typingTimer);
        $scope.UI.typingTimer = $timeout(()=>{
            if ($scope.form.isUsernameSuggest !== undefined || $scope.form.isUsernameSuggest !=='') {
                appService.usernameCheck( {
                    username:$scope.form.isUsernameSuggest,
                }, (response)=>{
                    if(!response.error) {
                        $scope.UI.isUsernameAvailable = true;
                    }else{
                        $scope.UI.isUsernameAvailable = false;
                    }
                });
            }
        },800);
    };

    $scope.login = function (){
        if ($scope.form.username === undefined || $scope.form.username ==='') {
            alert('Invalid username.');
        }else if($scope.form.password === undefined || $scope.form.password ==='') {
            alert('Invalid password.');
        }else{
            appService.login({
                username:$scope.form.username,
                password:$scope.form.password
            }, (response)=>{
                if (response.error) {
                    alert(response.message);
                }else{
                    window.location.href = '/home/'+response.userId;
                }
            });
        }
    }

    $scope.register = function (){
        if ($scope.form.isUsernameSuggest === undefined || $scope.form.isUsernameSuggest ==='') {
            alert('Invalid username.');
        }else if($scope.form.registerPassword === undefined || $scope.form.registerPassword ==='') {
            alert('Invalid password.');
        }else{
            appService.register({
                username:$scope.form.isUsernameSuggest,
                password:$scope.form.registerPassword
            }, (response)=>{
                if (response.error) {
                    alert(response.message);
                }else{
                    window.location.href = '/';
                }
            });
        }
    }
});


app.controller('home',  function ($scope,$timeout,socket,appService) {

    $scope.UI = {
        username : null,
        typingTimer : null,
        results : null,
        selectedUserId: null,
        selectedSocketId: null,
        selectedUserName: null,
        userId: null,
        socketId: null,
        messages: [],
        message: ''
    };
    $scope.message = '';
    $scope.UI.userId = appService.getUserid();

    if($scope.UI.userId === '' || typeof $scope.UI.userId == 'undefined') {
        window.location.replace('/');
    }else{
        appService.userSessionCheck((response)=>{
            if (response.error) {
                window.location.href='/';
            }else{
                $scope.UI.username = response.username;
                let userId = appService.getUserid();
                socket.connect(userId);
                socket.emit('chat-list',{userId:userId});
                socket.on('chat-list-response',(response)=>{
                    if (response.singleUser) {
                        let chatListUsers = $scope.UI.results.filter( ( obj ) =>{
                            if(obj._id === response.chatList['_id']){
                                return false;
                            }else{
                                return true;
                            }
                        });
                        $scope.UI.results = chatListUsers;
                        $scope.UI.results.push(response.chatList);

                    }else if(response.userDisconnected){
                        if ($scope.UI.results.length > 1) {
                            let chatListUsers = $scope.UI.results.filter( ( obj ) =>{
                                if(obj.socketId === response.socketId){
                                    obj.online = 'N';
                                }
                                return true;
                            });
                            $scope.UI.results =chatListUsers;
                        }
                    }else{
                        $scope.UI.results = response.chatList;
                    }
                });
                /*
                * subscribing for messages statrts
                */
                socket.on('add-message-response',(response)=> {
                    if($scope.UI.selectedUserId && $scope.UI.selectedUserId == response.fromUserId) {
                        $scope.UI.messages.push(response);
                        setTimeout( () =>{
                            document.querySelector('.message-thread').scrollTop = document.querySelector('.message-thread').scrollHeight;
                        },100);
                    }
                });
            }
        });
    }


    /*
	* Method to select the user from the Chat list starts
	*/
    $scope.selectedUser = function (user) {
        $scope.UI.selectedUserId = user._id;
        $scope.UI.selectedSocketId = user.socketId;
        $scope.UI.selectedUserName = user.username;
        /*
		* calling method to get the messages
		*/
        appService.getMessages({ userId : $scope.UI.userId, toUserId : user._id} , (response)=>{
            if(!response.error) {
                $scope.UI.messages = response.messages;
            }
        });
    };

    $scope.isUserSelected = function (userId) {
        if(!$scope.UI.selectedUserId) {
            return false;
        }
        return $scope.UI.selectedUserId ===  userId ? true : false;
    };

    $scope.sendMessage = function (event){
        event.preventDefault();
        if(event.keyCode === 13) {
            if($scope.message == '' || $scope.message == null) {
                alert('Tin nhắn không được để trống.');
            }else{
                if ($scope.message === '') {
                    alert('Tin nhắn không được để trống.');
                }else if($scope.UI.selectedUserId == null){
                    let url = appService.getUserid();
                    alert('Lựa chọn tài khoản để chat.');
                    setTimeout( () =>{
                        window.location.replace(/home/+url);
                    },100);
                }else{
                    const data = {
                        fromUserId : $scope.UI.userId,
                        toUserId : $scope.UI.selectedUserId,
                        fromSocketId : $scope.UI.socketId,
                        toSocketId : $scope.UI.selectedSocketId,
                        message : ($scope.message).trim(),
                        time: appService.Timing()
                    };
                    $scope.UI.messages.push(data);
                    setTimeout( () =>{
                        document.querySelector('.message-thread').scrollTop = document.querySelector('.message-thread').scrollHeight;
                    },100);
                    /*
                    * calling method to send the messages
                    */
                    $scope.message = null;
                    socket.emit('add-message', data);
                }
            }
        }
    };

    $scope.alignMessage = function (userId) {
        return $scope.UI.userId ===  userId ? false : true;
    };

    // $scope.logout = function(){
    //     socket.emit('logout',{ userId: appService.getUserid() });
    //     socket.on('logout-response',(response)=>{
    //         if (response.error == false) {
    //             window.location.href='/';
    //         }
    //     });
    // };

    $scope.getClassName = function(isOnline){
        if (isOnline==='N') {
            return 'user-offline';
        }else{
            return 'user-online';
        }
    };

    $scope.getOnlineStatus = function(isOnline){
        if (isOnline==='N') {
            return 'Offline';
        }else{
            return 'Online';
        }
    }
});