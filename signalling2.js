var express = require('express'),
app = express(),
server = require('http').createServer(app);

server.listen(8080);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/webrtc.html');
});

var WebSocketServer = require('ws').Server,
wss = new WebSocketServer({server: server});

// 存储socket的数组，这里只能有2个socket，每次测试需要重启，否则会出错
var wsc = [];
var monitors = [];//存放监控的连接
var monitors2 = [];
var videos = [];//存放摄像头
var videos2 = [];
index = 1;

monitors.indexof = function(ws){
    var a = this;
    var len = monitors.length
    for(var i = 0;i<len;i++){
        if(ws == a[i]){
            return i;
        }
    }
}

videos.indexof = function(ws){
    var a = this;
    var len = monitors.length
    for(var i = 0;i<len;i++){
        if(ws == a[i]){
            return i;
        }
    }
}

videos2.indexof = function(ws){
    var a = this;
    var len = videos2.length
    for(var i = 0 ;i<len;i++){
        if(ws == a[i]){
            return i;
        }
    }
}

monitors2.indexof = function(ws){
    var a = this;
    var len = monitors2.length;
    for(var i = 0;i<len;i++){
        if(ws == a[i]){
            return i;
        }
    }
}
// 有socket连入
wss.on('connection', function(ws) {
    console.log('connection');

    // 将socket存入数组
    //wsc.push(ws);

    for(var i = 0;i<wsc.length;i++){
            if(wsc[i] == ws){
                console.log('第'+i+'个人连接上来')
            }
        }
    // 记下对方socket在数组中的下标，因为这个测试程序只允许2个socket
    // 所以第一个连入的socket存入0，第二个连入的就是存入1
    // otherIndex就反着来，第一个socket的otherIndex下标为1，第二个socket的otherIndex下标为0
    var otherIndex = index--,
    desc = null;

    if (otherIndex == 1) {
        desc = 'first socket';
    } else {
        desc = 'second socket';
    }

    // 转发收到的消息
    ws.on('message', function(message) {
        var json = JSON.parse(message);
        console.log('received (' + desc + '): ', json);
        console.log('type -------->:',json.type)
        console.log('type = monitor-------->:',json.type=='monitor')
        console.log('commond -------->:',json.commond)

        if(json.commond == "video_reg"){
            videos.push(ws);
            console.log('连上了摄像机的主接口')
        }else if(json.commond == "monitor_reg"){
            monitors.push(ws);
        }else if(json.commond == "video_reg2"){
            videos2.push(ws);
            console.log("连上了一条备用的摄像机连接")
        }else if(json.commond == "monitor_reg2"){
            monitors2.push(ws);
            console.log("连接上一条备用的监控连接")
        }else if(json.type == 'monitor'){
            var index = monitors.indexof(ws);
                 console.log('收到一条monitor发送的信息,monitor:'+index)
                videos[index].send(message,function(error){
                    if(error){
                    console.log('第'+index+'监视器发送的消息，转发失败');
                    }
                });
                console.log('转发'+index+'monitor的信息给'+index+'video');
        }else if(json.type == 'video'){
            var index = videos.indexof(ws);
                console.log('收到一条video发送的信息,video:'+index)
                monitors[index].send(message,function(error){
                    if(error){
                    console.log('第'+index+'摄像头发送的消息，转发失败')
                    }
                });
                console.log('转发'+index+'video的信息给'+index+'monitor');
        }else if(json.type=='monitor2'){
            var index  = monitors2.indexof(ws);
            console.log('收到一条monitor备用发送的信息,monitor:'+index)
            videos2[index].send(message,function(error){
                if(error){
                    console.log('第'+index+'监视器备用线路发送的消息，转发失败')
                }
            });
            console.log('转发'+index+'monitor备用的信息给'+index+'video');
        }else if(json.type=='video2'){
            var index = videos2.indexof(ws);
            console.log('收到一条video备用发送的信息video2:'+index);
            monitors2[index].send(message,function(error){
                    if(error){
                    console.log('第'+index+'摄像头备用发送的消息，转发失败')
                    }
                });
                console.log('转发'+index+'video备用的信息给'+index+'monitor');
        }
        console.log("现在有video：",videos.length)
        console.log("现在有monitor：",monitors.length)
        console.log("现在有video备用：",videos2.length)
        console.log("现在有monitor备用：",monitors2.length)
        console.log("---------一次连接处理结束---------");



        //wsc[otherIndex].send(message, function (error) {
        //    if (error) {
        //        console.log('Send message error (' + desc + '): ', error);
        //    }
        //});
    });
});
