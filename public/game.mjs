import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let players = {};

let collectible = null;

socket.on('collectible', (item) => {
  collectible = item;
  drawGame();
});

socket.on('players', (serverPlayers) => {
  players = serverPlayers;

  drawGame();
});

function drawGame() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (collectible) {
    context.fillStyle = 'gold';

    context.fillRect(
      collectible.x,
      collectible.y,
      20,
      20
    );
  }

  for (const id in players) {
    const player = players[id];

    if (id === socket.id) {
      context.fillStyle = 'lime';
    } else {
      context.fillStyle = 'white';
    }

    context.fillRect(
      player.x,
      player.y,
      30,
      30
    );
  }
}

const currentPlayer = players[socket.id];

if (currentPlayer) {
  const player = new Player({
    x: currentPlayer.x,
    y: currentPlayer.y,
    score: currentPlayer.score,
    id: currentPlayer.id
  });

  const playerArray = Object.values(players);
  const rank = player.calculateRank(playerArray);

  context.fillStyle = 'white';
  context.font = '16px Arial';

  context.fillText(
    `Score: ${currentPlayer.score}`,
    10,
    25
  );

  context.fillText(
    rank,
    10,
    50
  );
}

document.addEventListener('keydown', (event) => {
  const playerData = players[socket.id];

  if (!playerData) {
    return;
  }

  const player = new Player({
    x: playerData.x,
    y: playerData.y,
    score: playerData.score,
    id: playerData.id
  });

  const speed = 10;

  if (event.key === 'w') {
    player.movePlayer('up', speed);
  }

  if (event.key === 's') {
    player.movePlayer('down', speed);
  }

  if (event.key === 'a') {
    player.movePlayer('left', speed);
  }

  if (event.key === 'd') {
    player.movePlayer('right', speed);
  }

  // Check collectible BEFORE sending data to server
  if (collectible) {
    const item = new Collectible({
      x: collectible.x,
      y: collectible.y,
      value: collectible.value,
      id: collectible.id
    });

    if (player.collision(item)) {
    socket.emit('collectibleCollected');
    }
  }

  socket.emit('playerMovement', {
    x: player.x,
    y: player.y,
  });
});