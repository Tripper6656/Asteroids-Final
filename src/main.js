const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
const initial = 10;
const cd = 2400;

var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var asteroids = [];
var level = 1;              
var score = 0;              
var state = 'instructions'; 
var pausekey = false;          
var bgMusic = new Audio('./assets/sounds/backgroundMusic.mp3'); 
bgMusic.loop = true;
bgMusic.volume = 0.5;
bgMusic.play();
var isStart = true;
var count = cd;
var playFieldHeight = canvas.height - 50;
for(var i = 0; i < initial; i++){
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
      if(!pausekey){
        pausekey = true;
        if(state == 'paused'){
          player.thrusting = false;
          state = 'playing';
        }
        else if(state == 'playing'){
          state = 'paused';
        }
      }
      break;
    case 'v':
      if(state == 'playing' && player.state == 'playing')
        player.warp(asteroids);
      break;
    default:
      if(state == 'playing' || state == 'menu'){
        player.buttonDown(event);
      }
	  else if (state == 'instructions' && isStart){
		state = 'menu';
		isStart = false;
	  }
	  else if (state == 'instructions' && !isStart){
		state = 'playing';
	  }
      break;
  }
}

//Handles Key Up
window.onkeyup = function(event) {
  switch(event.key) {
    case 'p':
      event.preventDefault();
      pausekey = false;
      break;
    default:
      if(state == 'playing' || state == 'menu'){
        player.buttonUp(event);
      }
      break;
  }
}

window.onblur = function(){
  if(state == 'playing' || state == 'menu'){
    state = 'paused';
  }
}

function update(elapsedTime) {
  switch(state) {
	case 'gameover':
    case 'menu': 
      count -= elapsedTime;
      if(count <= 0){
        count = cd;
        state = 'playing';
        player.state = 'playing';
      }
    case 'playing':
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
          state = 'menu';
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
  if(player.state == 'playing'){
    for(var i = 0; i < asteroids.length; i++){
      var distSquared =
        Math.pow((player.position.x + 10) - (asteroids[i].position.x + asteroids[i].radius), 2) +
        Math.pow((player.position.y + 10) - (asteroids[i].position.y + asteroids[i].radius), 2);
      if(asteroids[i].state != 'death' && distSquared < Math.pow(10 + asteroids[i].radius, 2)) {
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
      if( i != j && asteroids[i].state != 'death' && asteroids[j].state != 'death'){
        var distSquared =
          Math.pow((asteroids[i].position.x + asteroids[i].radius) - (asteroids[j].position.x + asteroids[j].radius), 2) +
          Math.pow((asteroids[i].position.y + asteroids[i].radius) - (asteroids[j].position.y + asteroids[j].radius), 2);
        if(distSquared <= Math.pow(asteroids[i].radius + asteroids[j].radius, 2)){
			
          if(asteroids[i].collisionCounter <= 0)
            asteroids[i].collide();
          var angle = Math.atan(Math.abs(asteroids[i].position.y - asteroids[j].position.y)/Math.abs(asteroids[i].position.x - asteroids[j].position.x));
          if(asteroids[i].position.y <= asteroids[j].position.y )
            angle *= -1;
		
		  var velocityxi = asteroids[i].velocity.x;
		  var velocityxj = asteroids[j].velocity.x;
		  var velocityyi = asteroids[i].velocity.y;
		  var velocityyj = asteroids[j].velocity.y;
		  
		  var cosxi = velocityxi*Math.cos(angle);
		  var cosxj = velocityxj*Math.cos(angle);
		  var sinxi = velocityxi*Math.sin(angle);
		  var sinxj = velocityxj*Math.sin(angle);
		  var cosyi = velocityyi*Math.cos(angle);
		  var cosyj = velocityyj*Math.cos(angle);
		  var sinyi = velocityyi*Math.sin(angle);
		  var sinyj = velocityyj*Math.sin(angle);
          var X1 = cosxi - sinyi;
          var Y1 = sinxi + cosyi;
          var X2 = cosxj - sinyj;
          var Y2 = sinxj + cosyj;
		  
		  var massi = asteroids[i].mass;
		  var massj = asteroids[j].mass;
          var Vel1 = X1*((massi - massj)/(massi + massj)) + X2*((2*massj)/(massi + massj));
          var Vel2 = X2*((massj - massi)/(massj + massi)) + X1*((2*massi)/(massj + massi));
          velocityxi = Vel1*Math.cos(-angle) - Y1*Math.sin(-angle);
          velocityyi = Vel1*Math.sin(-angle) + Y1*Math.cos(-angle);
          velocityxj = Vel2*Math.cos(-angle) - Y2*Math.sin(-angle);
          velocityyj = Vel2*Math.sin(-angle) + Y2*Math.cos(-angle);
		  
		  var posxi = asteroids[i].position.x;
		  var posxj = asteroids[j].position.x;
		  var posyi = asteroids[i].position.y;
		  var posyj = asteroids[j].position.y;
          var XP1 = posxi*Math.cos(angle) - posyi*Math.sin(angle);
          var YP1 = posxi*Math.sin(angle) + posyi*Math.cos(angle);
          var XP2 = posxj*Math.cos(angle) - posyj*Math.sin(angle);
          var YP2 = posxj*Math.sin(angle) + posyj*Math.cos(angle);
          var collide = Math.ceil(((asteroids[i].radius + asteroids[j].radius) - Math.abs(posxi - posxj))/8);
          if(collide > 0){
            if(posxi > posxj){
              XP1 += collide;
              XP2 -= collide;
            }
            else{
              XP1 -= collide;
              XP2 += collide;
            }
          }
          posxi = XP1*Math.cos(-angle) - YP1*Math.sin(-angle);
          posyi = XP1*Math.sin(-angle) + YP1*Math.cos(-angle);
          posxj = XP2*Math.cos(-angle) - YP2*Math.sin(-angle);
          posyj = XP2*Math.sin(-angle) + YP2*Math.cos(-angle);
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
  else if(state == 'menu'){
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'Purple';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.font = "75px Sans";
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
		ctx.textAlign = "center";
		ctx.fillText(Math.ceil(count/(cd/3)),  canvas.width/2, canvas.height/2); 
		ctx.strokeText(Math.ceil(count/(cd/3)),  canvas.width/2, canvas.height/2);
  }
}

//New Level
function new_level(){
  level++;
  score += 100;
  player.restart();
  if(level%2) player.lives++;
  state = 'menu';
  asteroids = [];
  for(var i = 0; i < initial; i++){
    asteroids.push(new Asteroid(level, canvas, 3));
  }
}