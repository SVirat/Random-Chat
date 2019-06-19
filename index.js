'use strict';

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

require('./server.js')(io, app);
require('./globals.js');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', (req, res) => {
  let noOfUsers = onlineUsers.length;
  res.render('index', { noOfUsers: noOfUsers });
});

app.get('/chat', (req, res) => {
  //var randomName = findName();
  res.render('chat');
});

function findName() {
  var fs = require('fs');
  var readline = require('readline');
  var adjectives = fs.readFileSync('adjectives.txt').toString('utf-8').split('\n');
  var animals = fs.readFileSync('animals.txt').toString('utf-8').split('\n');
  var adjective = adjectives[Math.floor(Math.random()*adjectives.length)];
  //the randomly generated name is a random adjective + a random animal
  return adjective.charAt(0).toUpperCase() + adjective.slice(1) + " " + animals[Math.floor(Math.random()*animals.length)];
}

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
