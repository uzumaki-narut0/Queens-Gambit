var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);	//socket server which integrates with (mounts on) http server
var hbs = require('express-handlebars');

//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
var portnumber = process.env.PORT || 8080;

app.engine('hbs',hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname+'/views'}));//first argument is engine name which can be anything
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
  res.render('home_page');
});

app.get('/:id/:playas',function(req,res){
  console.log('here');
  res.render('index',{id: req.params.id, playas: req.params.id.playas});
  //res.status(200).send(html);
})

var rooms = ['room1' , 'room2' , 'room3'];
var users = {};	//users list

io.on('connection', function(socket){
  console.log('a user connected');

  //when the client emits play, this listenes and executes
  socket.on('play',function(user_name){

  	//stores the username in socket session for this client
  	console.log(user_name);
  	socket.username = user_name;
  	socket.uniquekey = Math.random().toString(36).slice(2);	//a unique key corresponding to this game

    

    /*
  	users[user_name] = user_name;
  	console.log(Object.keys(users).length);

  	//stores the user room in socket session for this client
  	socket.room = 'room1';

  	//send client to room1
  	socket.join('room1');

  	//echo to client they have connected!
  	socket.emit('updatechat','SERVER','You have connected to room1');

  	//echo to room1 that a person has connected to room1
  	socket.broadcast.to('room1').emit('updatechat','SERVER',user_name + 'has created this room');

  	socket.emit('updaterooms',rooms,'room1');
    */

  });



  //when the client emits join, this listenes and executes
  socket.on('join',function(user_name, unique_key){

  	//stores the username in socket session for this client
  	console.log(user_name + " : " + unique_key);
  	socket.username = user_name;

  	users[user_name] = user_name;
  	console.log(Object.keys(users).length);

  	//stores the user room in socket session for this client
  	socket.room = 'room1';

  	//send client to room1
  	socket.join('room1');

  	//echo to client they have connected!
  	socket.emit('updatechat','SERVER','You have connected to room1');

  	//echo to room1 that a person has connected to room1
  	socket.broadcast.to('room1').emit('updatechat','SERVER',user_name + 'has joined this room');

  	socket.emit('updaterooms',rooms,'room1');

  });


  //when the client emits send move, this listenes and executes
  socket.on('sendmove',function(source, target){

  	//we tell the client to execute 'updateboard' with the parameters
  	console.log(source + " " + target);
  	io.sockets.in(socket.room).emit('updateboard',socket.username, source, target);

  });


  //when the user disonnects... perform this
  socket.on('disonnect',function(){
  	//echo globally that this client has left
  	socket.broadcast.emit('updatechat','SERVER',socket.username + " disonnected");
  	socket.leave(socket.room);
  });


});

http.listen(8080, function(){
  console.log('listening on *:8080');
});