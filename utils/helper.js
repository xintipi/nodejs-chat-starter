class Helper{

    constructor(){
        this.Mongodb = require("./db");
    }

    /*
    * Name of the Method : userNameCheck
    * Description : To check if the username is available or not.
    * Parameter :
    *		1) data query object for MongDB
    *		2) callback function
    * Return : callback
    */
    userNameCheck(data,callback){
        this.Mongodb.onConnect(function (db, ObjectID) {
            db.collection('users').find(data).count(function (err, result) {
                db.close();
                callback(result);
            })
        })
    }

    /*
    * Name of the Method : login
    * Description : login the user.
    * Parameter :
    *		1) data query object for MongDB
    *		2) callback function
    * Return : callback
    */
    login(data,callback){
        this.Mongodb.onConnect(function (db, ObjectID) {
            db.collection('users').findAndModify( data, [], {$set: {'online': 'Y'}},{}, function (err, result) {
                db.close();
                callback(err, result.value);
            })
        })
    }
    /*
    * Name of the Method : registerUser
    * Description : register the User
    * Parameter :
    *		1) data query object for MongDB
    *		2) callback function
    * Return : callback
    */
    registerUser(data,callback){
        this.Mongodb.onConnect(function (db, ObjectID) {
            db.collection('users').insertOne(data, function (err, result) {
                db.close();
                callback(err,result);
            })
        })
    }
    /*
    * Name of the Method : userSessionCheck
    * Description : to check if user is online or not.
    * Parameter :
    *		1) data query object for MongDB
    *		2) callback function
    * Return : callback
    */
    userSessionCheck(data,callback){
        this.Mongodb.onConnect(function (db, ObjectID) {
            db.collection('users').findOne({ _id : ObjectID(data.userId) , online : 'Y'}, function (err, result) {
                db.close();
                callback(err,result);
            })
        })
    }


    /*
    * Name of the Method : getUserInfo
    * Description : to get information of single user.
    * Parameter :
    *		1) userId of the user
    *		2) callback function
    * Return : callback
    */
    getUserInfo(userId,callback){
        this.Mongodb.onConnect(function (db, ObjectID) {
            db.collection('users').findOne({ _id : ObjectID(userId)}, function (err, result) {
                db.close();
                callback(err,result);
            })
        })
    }

    /*
    * Name of the Method : addSocketId
    * Description : Updates the socket id of single user.
    * Parameter :
    *		1) userId of the user
    *		2) callback function
    * Return : callback
    */
    addSocketId(data,callback){
        this.Mongodb.onConnect(function (db, ObjectID) {
            db.collection('users').update({ _id : ObjectID(data.id)}, data.value , function (err, result) {
                db.close();
                callback(err,result.result);
            })
        })
    }

    /*
	* Name of the Method : insertMessages
	* Description : To insert a new message into DB.
	* Parameter :
	*		1) data comprises of message,fromId,toId
	*		2) callback function
	* Return : callback
	*/
    insertMessages(data,callback){
        this.Mongodb.onConnect( (db,ObjectID) => {
            db.collection('messages').insertOne(data, (err, result) =>{
                db.close();
                callback(err,result);
            });
        });
    }

    /*
    * Name of the Method : getMessages
    * Description : To fetch messages from DB between two users.
    * Parameter :
    *		1) userId, toUserId
    *		2) callback function
    * Return : callback
    */
    getMessages(userId, toUserId, callback){

        const data = {
            '$or' : [
                { '$and': [
                    {
                        'toUserId': userId
                    },{
                        'fromUserId': toUserId
                    }
                ]
                },{
                    '$and': [
                        {
                            'toUserId': toUserId
                        }, {
                            'fromUserId': userId
                        }
                    ]
                },
            ]
        };
        this.Mongodb.onConnect( (db,ObjectID) => {
            db.collection('messages').find(data).sort({'timestamp':1}).toArray( (err, result) => {
                db.close();
                callback(err,result);
            });
        });
    }

    /*
    * Name of the Method : logout
    * Description : To logout the loggedin user.
    * Parameter :
    *		1) userID
    *		2) callback function
    * Return : callback
    */
    logout(userID,callback){

        const data = {
            $set :{
                online : 'N'
            }
        };
        this.Mongodb.onConnect(function (db, ObjectID) {
            db.collection('users').update({_id : ObjectID(userID)}, data , function (err, result) {
                db.close();
                callback(err,result.result);
            })
        })
    }

    /*
    * Name of the Method : getChatList
    * Description : To get the list of online user.
    * Parameter :
    *		1) userId (socket id) of the user
    *		2) callback function
    * Return : callback
    */
    getChatList(userId,callback){
        this.Mongodb.onConnect(function (db, ObjectID) {
            db.collection('users').find({ _id: {$ne: ObjectID(userId)}}, { username: 1, online: 1, socketId: 1 }).toArray(function (error, result) {
                db.collection('users').find({ _id: {$ne: ObjectID(userId)}}, { socketId: 1 }).toArray(function (error, queryResult) {
                    db.close();
                    callback(error, { users: result, socketIds: queryResult })
                });
            })
        })
    }

    isUserLoggedOut(userSocketId,callback){
        this.Mongodb.onConnect(function (db, ObjectID) {
            db.collection('users').findAndModify({ socketId: userSocketId}, [], { $set: {'online': 'N'}}, {}, function (error, result) {
                db.close();
                if (error){
                    callback({loggedOut:true});
                }else{
                    if (result===null) {
                        callback({loggedOut:true});
                    }else{
                        if (result.online === 'Y') {
                            callback({loggedOut:false});
                        }else{
                            callback({loggedOut:true});
                        }
                    }
                }
            })
        })
    }
}

module.exports = new Helper();