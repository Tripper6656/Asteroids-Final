"use strict";

const MS_PER_FRAME = 1000/8;
const LASER_WAIT = 150;
const Laser = require('./laser.js');
module.exports = exports = Player;

//Creates Player
function Player(position, canvas) {
  this.canvas = canvas;
  this.W = canvas.width;
  this.H = canvas.height;
  this.position = {x: position.x, y: position.y};
  this.velocity = {x: 0, y: 0}
  this.angle = 0;
  this.radius  = 64;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.lives = 3;
  this.p_key = false;
  this.laser_wait = 0;
  this.lasers = [];
  this.color = "white";
  this.boom = new Audio('./assets/sounds/explosion.wav');
  this.explosionFrame = 0;
  this.state = 'ready';
  this.laserSound = new Audio('./assets/sounds/laser.wav');
  this.laserSound.volume = 0.5;
}

//Handles Player Inputs
Player.prototype.buttonDown = function(event){
  switch(event.key) {
    case ' ':
      event.preventDefault();
      if(this.state == 'running' && this.laser_wait >= LASER_WAIT){
        this.lasers.push(new Laser(this.position, (this.angle % (2*Math.PI) + Math.PI/2), this.canvas));
        this.laserSound.currentTime = 0;
        this.laserSound.play();
        this.laser_wait = 0;
      }
      break;
    case 'ArrowUp': // UP
    case 'w':
      this.thrusting = true;
      break;
    case 'ArrowLeft': // LEFT
    case 'a':
      this.steerLeft = true;
      break;
    case 'ArrowRight': // RIGHT
    case 'd':
      this.steerRight = true;
      break;
  }
}
Player.prototype.buttonUp = function(event){
  switch(event.key) {
    case 'ArrowUp': // UP
    case 'w':
      this.thrusting = false;
      break;
    case 'ArrowLeft': // LEFT
    case 'a':
      this.steerLeft = false;
      break;
    case 'ArrowRight': // RIGHT
    case 'd':
      this.steerRight = false;
      break;
  }
}

//Adds the warp function
Player.prototype.warp = function(asteroids){
  var valid = false;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.velocity = {x: 0, y: 0}
  this.position = {x: Math.random()*this.W,y: Math.random()*this.H};
  for(var i = 0; i < asteroids.length; i++){
    var dist = Math.sqrt(
      Math.pow((this.position.x) - (asteroids[i].position.x + asteroids[i].radius), 2) +
      Math.pow((this.position.y) - (asteroids[i].position.y + asteroids[i].radius), 2));
    if(dist < asteroids[i].radius + 100 && asteroids[i].state == 'running') {
      this.position = {x: Math.random()*this.W,y: Math.random()*this.H};
      i = 0;
    }
  }
}

//Player Explodes
Player.prototype.explode = function() {
  this.lasers = [];
  this.lives--;
  this.state = 'exploding';
  this.boom.currentTime = 0;
  this.boom.play();
}

//Player Reset
Player.prototype.restart = function() {
  this.lasers = [];
  this.angle = 0;
  this.position = {x: this.W/2, y: this.H/2};
  this.state = 'ready';
  this.velocity = {x: 0,y: 0};
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.explosionFrame = 0;
  this.laser_wait = 0;
}

//Updates Player
Player.prototype.update = function(time) {
  switch(this.state){
    case 'ready':
    case 'running':
      this.laser_wait += time;
      if(this.steerLeft) {
        this.angle += time * 0.005;
      }
      if(this.steerRight) {
        this.angle -= 0.1;
      }
      if(this.thrusting) {
        var acceleration = {
          x: Math.sin(this.angle),
          y: Math.cos(this.angle)
        }
        this.velocity.x -= acceleration.x * 0.25;
        this.velocity.y -= acceleration.y * 0.25;
      }
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      if(this.position.x < 0) this.position.x += this.W;
      if(this.position.x > this.W) this.position.x -= this.W;
      if(this.position.y < 0) this.position.y += this.H;
      if(this.position.y > this.H) this.position.y -= this.H;
      for(var i = 0; i < this.lasers.length; i++){
        this.lasers[i].update(time);
        if(this.lasers[i].remove){
          this.lasers.splice(i,1);
        }
      }
      break;
    case 'exploding':
      this.explosionFrame++;
      if(this.explosionFrame >= 16){
        this.state = 'dead';
      }
      break;
    case 'dead':
      break;
  }
}

//Renders Player
Player.prototype.render = function(time, ctx) {
  if(this.state == 'running' || this.state == 'ready'){
    ctx.save();
    for(var i = 0; i < this.lasers.length; i++){
      this.lasers[i].render(time, ctx);
    }
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(-this.angle);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-10, 10);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.strokeStyle = this.color;
    ctx.stroke();
    if(this.thrusting) {
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(5, 10);
      ctx.arc(0, 10, 5, 0, Math.PI, true);
      ctx.closePath();
      ctx.strokeStyle = 'orange';
      ctx.stroke();
    }
    ctx.restore();
  }
  else{
    ctx.strokeStyle = "#ff0000";
	ctx.beginPath(); 
    ctx.moveTo(this.position.x + 5,this.position.y + 5);
    ctx.lineTo(this.position.x + 12,this.position.y + 15);
    ctx.lineTo(this.position.x,this.position.y + 18); 
    ctx.lineTo(this.position.x + 12,this.position.y + 21);
    ctx.lineTo(this.position.x + 5,this.position.y + 31);  
    ctx.lineTo(this.position.x + 16,this.position.y + 25);
    ctx.lineTo(this.position.x + 19,this.position.y + 37);
    ctx.lineTo(this.position.x + 22,this.position.y + 25);
    ctx.lineTo(this.position.x + 33,this.position.y + 31);
    ctx.lineTo(this.position.x + 26,this.position.y + 21);
    ctx.lineTo(this.position.x + 38,this.position.y + 18);
    ctx.closePath();
    ctx.stroke();
  }
}
