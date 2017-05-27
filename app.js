var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);	//socket server which integrates with (mounts on) http server
var hbs = require('express-handlebars');
var handlebars = require('handlebars');
var helpers = require('handlebars-form-helpers').register(handlebars);

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
  console.log(req.params);
  res.render('index', {id: req.params.id,
    playas: req.params.playas
  });
  //res.status(200).send(html);
})

var game_room = {};
var users = {};	//users list

io.on('connection', function(socket){
  console.log('a user connected');

  //when the client emits play, this listenes and executes
  socket.on('create',function(uniquekey){

  	socket.uniquekey = uniquekey;	//a unique key corresponding to this game

    game_room[uniquekey] = uniquekey;
  	socket.room = game_room[uniquekey];
    console.log(socket.room);

  	//send client to room game_room[uniquekey]
  	socket.join(game_room[uniquekey]);

  	//echo to client they have connected!
  	socket.emit('updatechat','SERVER','You have connected to room' + game_room[uniquekey]);

  	//echo to room1 that a person has connected to room1
  	socket.broadcast.to(game_room[uniquekey]).emit('updatechat','SERVER',"user_name" + 'has created this room');

  	//socket.emit('updaterooms',rooms,'room1');

  });



  //when the client emits join, this listenes and executes
  socket.on('join',function(uniquekey){

  	//stores the username in socket session for this client
  	console.log(uniquekey);
  //	socket.username = user_name;
  	//send client to room1
    socket.room = game_room[uniquekey];
  	socket.join(game_room[uniquekey]);
    console.log(socket.room);

  	//echo to client they have connected!
  	socket.emit('updatechat','SERVER','You have connected to '+ game_room[uniquekey]);

  	//echo to room1 that a person has connected to room1

  	socket.broadcast.to(game_room[uniquekey]).emit('updatechat','SERVER',"user_name" + 'has joined this room');

  //	socket.emit('updaterooms',rooms,'room1');

  });


  //when the client emits send move, this listenes and executes
  socket.on('sendmove',function(source, target, uniquekey){

  	//we tell the client to execute 'updateboard' with the parameters
  	console.log(source + " " + target);
   // console.log(game_room[uniquekey]);
  	io.sockets.in(game_room[uniquekey]).emit('updateboard', source, target);

  });


  socket.on('whosechance',function(currplayer, uniquekey){
    console.log('in whose chance');
    io.sockets.in(game_room[uniquekey]).emit('flipchance',currplayer);
  })

  socket.on('sendchat',function(msg, uniquekey){
    io.sockets.in(game_room[uniquekey]).emit('updatechatui',msg);
  });

  //when the user disonnects... perform this
  socket.on('disonnect',function(){
  	//echo globally that this client has left
  	socket.broadcast.emit('updatechat','SERVER', " disonnected");
  	socket.leave(socket.room);
  });


});

http.listen(8080, function(){
  console.log('listening on *:8080');
});