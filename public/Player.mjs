class Player {
  constructor({ x, y, score, id }) {
  this.x = x;
  this.y = y;
  this.score = score;
  this.id = id;

  this.width = 30;
  this.height = 30;
  }

  movePlayer(dir, speed) {
  if (dir === 'up') {
    this.y -= speed;
  }

  if (dir === 'down') {
    this.y += speed;
  }

  if (dir === 'left') {
    this.x -= speed;
  }

  if (dir === 'right') {
    this.x += speed;
  }

  // Keep player inside the game area
  if (this.x < 0) {
    this.x = 0;
  }

  if (this.y < 0) {
    this.y = 0;
  }

  if (this.x + this.width > 640) {
    this.x = 640 - this.width;
  }

  if (this.y + this.height > 480) {
    this.y = 480 - this.height;
  }
 }


  collision(item) {
  return (
    this.x < item.x + item.width &&
    this.x + this.width > item.x &&
    this.y < item.y + item.height &&
    this.y + this.height > item.y
  );
 }

  calculateRank(arr) {
  const sortedPlayers = [...arr].sort((a, b) => b.score - a.score);

  const rank =
    sortedPlayers.findIndex((player) => player.id === this.id) + 1;

  return `Rank: ${rank} / ${arr.length}`;
}
}

export default Player;
