"use strict";
module.exports = exports = Game;

//Creates Game
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');
  this.oldTime = performance.now();
  this.paused = false;
}

//Pause
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;
  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}
