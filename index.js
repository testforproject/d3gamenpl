var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var defender,attacker;
var connections = [];
var clients = {};

var bombs = [];

app.use(express.static(__dirname + '/js'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/d3game.html');
});

io.on('connection', function(socket){
	var conn = {id:socket.id};
	if(connections.length<2){

		console.log('a user connected');
		if(connections.length == 0){
			conn.type = 'defender';
		}
		else {
			if(connections[0].type==='defender') {
				conn.type = 'attacker';
			}
			else if(connections[0].type==='attacker'){
				conn.type = 'defender';
			}
		}
		connections.push(conn);
		clients[socket.id] = socket;
		socket.emit('type',conn);
		if((connections.length == 2)){
			io.emit('opponent',true);
			bombs = [];
			io.emit('begin','');
		}
		
		socket.on('ack',function(data){
			console.log('acknowledgement');
			console.log(data);
		});
		socket.on('ready',function(data){
			console.log(""+data.type+" is ready");
		});
		socket.on('rotationAngle',function(data){
			console.log('inside rotation');
			console.log(data);
		});
		socket.on('defenderData',function(data){
			clients[connections[1].id].emit('defenderData',data);
		});
		socket.on('score',function(data){
			clients[connections[1].id].emit('score',data);
		});
		socket.on('health',function(data){
			clients[connections[1].id].emit('health',data);
		});
		socket.on('bombs',function(data){
			console.log('value of bombs');
			console.log(data);
			bombs.push(data);
			io.emit('bombs',bombs);
		});
		socket.on('announce',function(data){
			console.log(data);
			io.emit('announce',data);
		});
		socket.on('logger',function(data){
			console.log('log from '+data.type);
			console.log(data.val);
		});
		socket.on('removeBomb',function(data){
			console.log('inside bomb removed');
			console.log(data);
			for(var i = 0;i<bombs.length;i++){
				if(bombs[i].id===data){
					console.log('inside if');
					bombs.splice(i,1);
				}
			}
			console.log(bombs);
		});

  		socket.on('disconnect', function(){
  			for(var i=0;i<connections.length;i++){
  				if(connections[i].id==socket.id) {
  					connections.splice(i,1);
  				}
  			}
    		console.log('user disconnected');
    		io.emit('opponent',false);
  		});
	}
	else {
		//code for else
		socket.emit('disconnecting');
		console.log('ending the connection');
		socket.disconnect();
	}
});


http.listen(3000,'192.168.1.100', function(){
  console.log('listening on *:3000');
});