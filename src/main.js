"use strict;"

const COUNTDOWN = 2400;
const INIT_ASTEROIDS = 10; // Initial asteroids.
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var asteroids = [];
var level = 1;              
var score = 0;              
var state = 'instructions'; 
var p_key = false;          
var bgMusic = new Audio('./assets/sounds/backgroundMusic.mp3'); 
bgMusic.loop = true;
bgMusic.volume = 0.5;
bgMusic.play();
var isStart = true;
var countDown = COUNTDOWN;
var playFieldHeight = canvas.height - 50;
for(var i = 0; i < INIT_ASTEROIDS; i++){
  asteroids.push(new Asteroid(level, canvas, 3));
}

var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

//Handles Key Down
window.onkeydown = function(event) {
  switch(event.key) {
    case 'p':
      event.preventDefault();
      if(!p_key){
        p_key = true;
        if(state == 'paused'){
          player.thrusting = false;
          state = 'running';
        }
        else if(state == 'running'){
          state = 'paused';
        }
      }
      break;
    case 'v':
      if(state == 'running' && player.state == 'running')
        player.warp(asteroids);
      break;
	case 'i':
	  if (state != 'instructions'){
		state = 'instructions';
	  }
	  else if (state == 'instructions' && isStart){
		state = 'ready';
		isStart = false;
	  }
	  else if (state == 'instructions' && !isStart){
		state = 'running';
	  }
	  break;
    default:
      if(state == 'running' || state == 'ready'){
        player.buttonDown(event);
      }
	  else if (state == 'instructions' && isStart){
		state = 'ready';
		isStart = false;
	  }
	  else if (state == 'instructions' && !isStart){
		state = 'running';
	  }
      break;
  }
}

//Handles Key Up
window.onkeyup = function(event) {
  switch(event.key) {
    case 'p':
      event.preventDefault();
      p_key = false;
      break;
    default:
      if(state == 'running' || state == 'ready'){
        player.buttonUp(event);
      }
      break;
  }
}

window.onblur = function(){
  if(state == 'running' || state == 'ready'){
    state = 'paused';
  }
}

function update(elapsedTime) {
  switch(state) {
    case 'ready': 
      countDown -= elapsedTime;
      if(countDown <= 0){
        countDown = COUNTDOWN;
        state = 'running';
        player.state = 'running';
      }
    case 'gameover':
    case 'running':
      player.update(elapsedTime);
      for(var i = 0; i < asteroids.length; i++){
        asteroids[i].update(elapsedTime);
        if(asteroids[i].remove)
          asteroids.splice(i, 1);
      }
      check_asteroid_collisions();
      check_laser_collisions();
      if(asteroids.length == 0){
        new_level();
      }
      check_player_collisions();
      if(player.state == 'dead'){
        if(player.lives > 0){
          player.restart();
          state = 'ready';
        }
        else{
          state = 'gameover';
        }
      }
      break;
    case 'paused':
      break;
  }
}

//Laser-Asteroid Collision
function check_laser_collisions(){
  for(var i = 0; i < asteroids.length; i++){
    for(var j = 0; j < player.lasers.length; j++){
      var distSquared =
        Math.pow((player.lasers[j].position.x) - (asteroids[i].position.x + asteroids[i].radius), 2) +
        Math.pow((player.lasers[j].position.y) - (asteroids[i].position.y + asteroids[i].radius), 2);
      if(distSquared < Math.pow(asteroids[i].radius, 2) && asteroids[i].state == 'default') {
        player.lasers[j].remove = true;
        asteroids[i].struck(asteroids);
        score += 10;
        return;
      }
    }
  }
}

//Player-Asteroid Collision
function check_player_collisions(){
  if(player.state == 'running'){
    for(var i = 0; i < asteroids.length; i++){
      var distSquared =
        Math.pow((player.position.x + 10) - (asteroids[i].position.x + asteroids[i].radius), 2) +
        Math.pow((player.position.y + 10) - (asteroids[i].position.y + asteroids[i].radius), 2);
      if(asteroids[i].state != 'exploding' && distSquared < Math.pow(10 + asteroids[i].radius, 2)) {
        player.explode();
        return;
      }
    }
  }
}

//Asteroid-Asteroid Collision
function check_asteroid_collisions(){
  for(var i = 0; i < asteroids.length; i++){
    for(var j = 0; j < asteroids.length; j++)
    {
      if( i != j && asteroids[i].state != 'exploding' && asteroids[j].state != 'exploding'){
        var distSquared =
          Math.pow((asteroids[i].position.x + asteroids[i].radius) - (asteroids[j].position.x + asteroids[j].radius), 2) +
          Math.pow((asteroids[i].position.y + asteroids[i].radius) - (asteroids[j].position.y + asteroids[j].radius), 2);
        if(distSquared <= Math.pow(asteroids[i].radius + asteroids[j].radius, 2)){
			
          if(asteroids[i].collisionCounter <= 0)
            asteroids[i].collide();
          var angle = Math.atan(Math.abs(asteroids[i].position.y - asteroids[j].position.y)/Math.abs(asteroids[i].position.x - asteroids[j].position.x));
          if(asteroids[i].position.y <= asteroids[j].position.y )
            angle *= -1;
          var aNewX = asteroids[i].velocity.x*Math.cos(angle) - asteroids[i].velocity.y*Math.sin(angle);
          var aNewY = asteroids[i].velocity.x*Math.sin(angle) + asteroids[i].velocity.y*Math.cos(angle);
          var bNewX = asteroids[j].velocity.x*Math.cos(angle) - asteroids[j].velocity.y*Math.sin(angle);
          var bNewY = asteroids[j].velocity.x*Math.sin(angle) + asteroids[j].velocity.y*Math.cos(angle);
          var aNewVel = aNewX*((asteroids[i].mass - asteroids[j].mass)/(asteroids[i].mass + asteroids[j].mass)) + bNewX*((2*asteroids[j].mass)/(asteroids[i].mass + asteroids[j].mass));
          var bNewVel = bNewX*((asteroids[j].mass - asteroids[i].mass)/(asteroids[j].mass + asteroids[i].mass)) + aNewX*((2*asteroids[i].mass)/(asteroids[j].mass + asteroids[i].mass));
          asteroids[i].velocity.x = aNewVel*Math.cos(-angle) - aNewY*Math.sin(-angle);
          asteroids[i].velocity.y = aNewVel*Math.sin(-angle) + aNewY*Math.cos(-angle);
          asteroids[j].velocity.x = bNewVel*Math.cos(-angle) - bNewY*Math.sin(-angle);
          asteroids[j].velocity.y = bNewVel*Math.sin(-angle) + bNewY*Math.cos(-angle);
          var aNewXPos = asteroids[i].position.x*Math.cos(angle) - asteroids[i].position.y*Math.sin(angle);
          var aNewYPos = asteroids[i].position.x*Math.sin(angle) + asteroids[i].position.y*Math.cos(angle);
          var bNewXPos = asteroids[j].position.x*Math.cos(angle) - asteroids[j].position.y*Math.sin(angle);
          var bNewYPos = asteroids[j].position.x*Math.sin(angle) + asteroids[j].position.y*Math.cos(angle);
          var overlap = Math.ceil(((asteroids[i].radius + asteroids[j].radius) - Math.abs(asteroids[i].position.x - asteroids[j].position.x))/8);
          if(overlap > 0){
            if(asteroids[i].position.x > asteroids[j].position.x){
              aNewXPos += overlap;
              bNewXPos -= overlap;
            }
            else{
              aNewXPos -= overlap;
              bNewXPos += overlap;
            }
          }
          asteroids[i].position.x = aNewXPos*Math.cos(-angle) - aNewYPos*Math.sin(-angle);
          asteroids[i].position.y = aNewXPos*Math.sin(-angle) + aNewYPos*Math.cos(-angle);
          asteroids[j].position.x = bNewXPos*Math.cos(-angle) - bNewYPos*Math.sin(-angle);
          asteroids[j].position.y = bNewXPos*Math.sin(-angle) + bNewYPos*Math.cos(-angle);
        }
      }
    }
  }
}

//Render
function render(elapsedTime, ctx) {
  ctx.clearRect(0, 0, canvas.width, playFieldHeight);
  for(var i = asteroids.length - 1; i >= 0; i--){
    asteroids[i].render(elapsedTime, ctx);
  }
  player.render(elapsedTime, ctx);
	ctx.fillStyle ='Purple';
	ctx.fillRect(0, playFieldHeight, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fillRect(2, playFieldHeight + 2, canvas.width - 4, 46);
	ctx.globalAlpha = 1.0;
	ctx.fillStyle = 'white';
	ctx.font = "25px Sans";
	ctx.fillText("Level:  " + level, 50, canvas.height - 16);
	ctx.fillText("Score:  " + score, canvas.width/2, canvas.height - 16);
  if(state != 'gameover'){ 
	for(var i = 0; i < player.lives; i++){
		ctx.globalAlpha = 0.6;
		ctx.save();
		ctx.translate(canvas.width - 50 - (30 * i), canvas.height - 24);
		ctx.beginPath();
		ctx.moveTo(0, -10);
		ctx.lineTo(-10, 10);
		ctx.lineTo(10, 10);
		ctx.closePath();
		ctx.strokeStyle = "#FFFFFF";
		ctx.stroke();
		ctx.restore();
	}
  }
  if(state == 'gameover'){
	ctx.globalAlpha = .6;
    ctx.fillStyle = 'Red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.font = "60px Sans";
	ctx.fillStyle = "red";
    ctx.strokeStyle = 'black';
	ctx.textAlign = "center";
	ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2); 
	ctx.strokeText("GAME OVER", canvas.width/2, canvas.height/2); 
	ctx.font = "35px Sans";
	ctx.fillStyle = "black";
	ctx.fillText("Score: " + score, canvas.width/2, canvas.height/2 + 40);
  }
  else if(state == 'paused'){
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'Purple';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
	ctx.textAlign = "center";
    ctx.fillStyle = 'White';
    ctx.font = "50px Sans";
    ctx.fillText("PAUSE", canvas.width/2, canvas.height/2); 
  }
  else if(state == 'instructions'){
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
	ctx.textAlign = "center";
    ctx.fillStyle = 'Purple';
    ctx.font = "50px Sans";
    ctx.fillText("ASTEROIDS", canvas.width/2, 100); 
	ctx.fillStyle = 'black';
	ctx.font = "25px Sans";
	ctx.fillText("Movement:", canvas.width/2, 200);
	ctx.font = "20px Sans";
	ctx.fillText("Accelerate: Up or W", canvas.width/2, 230);
	ctx.fillText("Rotate: Left and Right or A and D", canvas.width/2, 260);
	ctx.fillText("Shoot: Spacebar", canvas.width/2, 290);
	ctx.fillText("Warp: V", canvas.width/2, 320);
	ctx.font = "20px Sans";
	ctx.fillText("Pause: P", canvas.width/2, 350);
	ctx.fillStyle = "purple";
	ctx.font = "60px Sans";
	ctx.fillText("Press any key to start", canvas.width/2, 450);
  }

  // Ready screen
  else if(state == 'ready'){
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'Purple';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.font = "75px Sans";
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
		ctx.textAlign = "center";
		ctx.fillText(Math.ceil(countDown/(COUNTDOWN/3)),  canvas.width/2, canvas.height/2); 
		ctx.strokeText(Math.ceil(countDown/(COUNTDOWN/3)),  canvas.width/2, canvas.height/2);
  }
}

//New Level
function new_level(){
  level++;
  score += 100;
  player.restart();
  if(level%2) player.lives++;
  state = 'ready';
  asteroids = [];
  for(var i = 0; i < INIT_ASTEROIDS; i++){
    asteroids.push(new Asteroid(level, canvas, 3));
  }
}