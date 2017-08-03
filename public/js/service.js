class AppService{

    constructor($http){
        this.http = $http;
    }

    httpCall(params,callback){
        if (params.url === undefined || params.url === '') {
            alert('Invalid Server call');
            return;
        }
        this.http({
            url:params.url,
            method: 'POST',
            data:params.data
        }).then( (response) =>{
            callback(response.data);
        }, (response) =>{
            callback(response.data);
        });
    }

    login(data,callback){
        if (data.username === undefined || data.username ===''){
            callback({
                error:true,
                message:'Invalid username.'
            });
        }else if(data.password === undefined || data.password ===''){
            callback({
                error:true,
                message:'Invalid password.'
            });
        }else{
            const params = {
                url : '/login',
                data : {
                    username:data.username,
                    password:data.password
                }
            };
            this.httpCall(params, (response)=>{
                callback(response);
            });
        }
    }

    usernameCheck(data,callback){
        if (data.username === undefined || data.username ===''){
            callback({
                error:true,
                message:'Invalid username.'
            });
        }else{
            const params = {
                url : '/usernameCheck',
                data : {
                    username:data.username
                }
            };
            this.httpCall(params, (response)=>{
                callback(response);
            });
        }
    }

    getMessages(data, callback){
        if(data.userId == ''){
            callback({
                error: true,
                message: 'Invalid userId.'
            })
        }else if(data.toUserId == ''){
            callback({
                error: true,
                message: 'Invalid toUserId.'
            })
        }else{
            const params = {
                url : '/getMessages',
                data : {
                    userId: data.userId,
                    toUserId: data.toUserId
                }
            };
            this.httpCall(params, (response)=>{
                callback(response);
            });
        }
    }

    register(data,callback){
        if (data.username === undefined || data.username ===''){
            callback({
                error:true,
                message:'Invalid username.'
            });
        }else if(data.password === undefined || data.password ===''){
            callback({
                error:true,
                message:'Invalid password.'
            });
        }else{
            const params = {
                url : '/registerUser',
                data : {
                    username:data.username,
                    password:data.password
                }
            };
            this.httpCall(params, (response)=>{
                callback(response);
            });
        }
    }

    getUserid(){
        const urlData = (window.location.pathname).split('/');
        if (urlData.length < 3 ) {
            window.location.herf = '/';
        }else{
            return urlData[urlData.length-1];
        }
    }

    Timing(){

        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth()+1; //January is 0!
        let yyyy = today.getFullYear();
        let h = today.getHours();
        let m = today.getMinutes();

        if(dd < 10) {
            dd = '0' + dd
        }

        if(mm < 10) {
            mm = '0' + mm
        }
        if (m < 10){
            m = '0' + m
        }
        if(h > 12){
            return dd + '/' + mm + '/' + yyyy + ', ' + h + ':' + m + ' pm';
        }else return dd + '/' + mm + '/' + yyyy + ', ' + h + ':' + m + ' am';


    }

    userSessionCheck(callback){
        let userId = this.getUserid();
        const params = {
            url : '/userSessionCheck',
            data : {
                userId:userId
            }
        };
        this.httpCall(params, (response)=>{
            callback(response);
        });
    }

}