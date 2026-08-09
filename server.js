require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const io = socket(server);

const players = {};

let collectible = {
  x: 300,
  y: 200,
  value: 1,
  id: 'collectible-1'
};

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  players[socket.id] = {
    x: 100,
    y: 100,
    score: 0,
    id: socket.id
  };

  io.emit('players', players);
  socket.emit('collectible', collectible);

  socket.on('playerMovement', (playerData) => {
    if (players[socket.id]) {
      players[socket.id].x = playerData.x;
      players[socket.id].y = playerData.y;

      io.emit('players', players);
    }
  });

  socket.on('collectibleCollected', () => {
  if (players[socket.id]) {
    players[socket.id].score += collectible.value;

    collectible = {
      x: Math.floor(Math.random() * 600),
      y: Math.floor(Math.random() * 440),
      value: 1,
      id: 'collectible-1'
    };

    io.emit('players', players);
    io.emit('collectible', collectible);
  }
});

  socket.on('disconnect', () => {
    console.log('A player disconnected:', socket.id);

    delete players[socket.id];

    io.emit('players', players);
  });
});

module.exports = app; // For testing
