"use strict";

const mspf = 1000/8;
const lspeed = 20;
module.exports = exports = Laser;

//Creates Lasers
function Laser(position, angle, canvas) {
  this.W = canvas.width;
  this.H = canvas.height;
  this.position = {x: position.x, y: position.y};
  this.angle = angle;
  this.velocity = {x: Math.cos(this.angle), y: Math.sin(this.angle)};
  this.color = "yellow";
  this.remove = false;
}

//Updates Lasers
Laser.prototype.update = function(time) {
  this.position.x += this.velocity.x * lspeed;
  this.position.y -= this.velocity.y * lspeed;
  if(this.position.x < 0 || this.position.x > this.W ||
     this.position.y < 0 || this.position.y > this.H){
    this.remove = true;;
  }
}

//Renders Lasers
Laser.prototype.render = function(time, ctx) {
    ctx.save();
    ctx.strokeStyle = "#ffff1a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x + lspeed*this.velocity.x, this.position.y - lspeed*this.velocity.y);
    ctx.stroke();
    ctx.restore();
}
