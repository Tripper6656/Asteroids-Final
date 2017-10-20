"use strict";

const MS_PER_FRAME = 1000/8;
const LASER_SPEED = 20;
module.exports = exports = Laser;

//Creates Lasers
function Laser(position, angle, canvas) {
  this.W = canvas.width;
  this.H = canvas.height;
  this.position = {x: position.x, y: position.y};
  this.angle = angle;
  this.velocity = {x: Math.cos(this.angle), y: Math.sin(this.angle)};
  this.color = "green";
  this.remove = false;
}

//Updates Lasers
Laser.prototype.update = function(time) {
  this.position.x += this.velocity.x * LASER_SPEED;
  this.position.y -= this.velocity.y * LASER_SPEED;
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
    ctx.lineTo(this.position.x + LASER_SPEED*this.velocity.x, this.position.y - LASER_SPEED*this.velocity.y);
    ctx.stroke();
    ctx.restore();
}
