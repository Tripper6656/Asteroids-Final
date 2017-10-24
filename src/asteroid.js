const mspf = 1000/8;
const minCollision = 1000;
module.exports = exports = Asteroid;
var boom = new Audio('assets/sounds/explosion.wav');
boom.playbackRate = 3;
  
//Creates Asteroids
function Asteroid(level, canvas, size, pos, Vel, Di) {
  this.level = level;
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  if(Di) this.diameter = Di;
  else this.diameter  = Math.random() * 40 + 80;
  this.radius = this.diameter/2;
  this.mass = this.diameter / 120;
  this.size = size;;
  this.canvas = canvas;
  this.state = 'default';
  this.explosionFrame = 0;
  this.remove = false;
  this.collisionCounter = minCollision;
  
  if(pos){
    this.position = {x: pos.x + 5, y: pos.y + 5};
  }
  else{
    do{
      this.position = {
        x: Math.random() * (canvas.width - this.diameter) + this.diameter/2,
        y: Math.random() * (canvas.height - this.diameter) + this.diameter/3
      };
    }while(this.position.x > canvas.width/2 - 150 && this.position.x < canvas.width/2 + 50
            && this.position.y > canvas.height/2 - 150 && this.position.y < canvas.height/2 + 50)
  }

  if(Vel){
    this.velocity = Vel;
  }
  else{
    var tempX = Math.random() + 0.5*(this.level-1);
    var tempY = Math.random() + 0.5*(this.level-1);
    if(Math.random() > 0.5) tempX *= -1;
    if(Math.random() > 0.5) tempY *= -1;
    this.velocity = {x: tempX,y: tempY};
  }
  this.count = 0;
  this.angle = Math.random() * 2 * Math.PI;
  this.angularVelocity = Math.random() * 0.1 - 0.05;
}

//Asteroid hit
Asteroid.prototype.struck = function(asteroids) {
  this.state = 'death';
  boom.currentTime = 0;
  boom.play();
  if(this.size > 1){
    var angle = Math.atan(this.velocity.y/this.velocity.x);
    var v1 = {x: Math.cos(angle + Math.PI/4)*1.5, y: Math.sin(angle + Math.PI/4)*1.5};
    var v2 = {x: Math.cos(angle - Math.PI/4)*1.5, y: Math.sin(angle - Math.PI/4)*1.5};
    var Asteroid1 = new Asteroid(this.level, this.canvas, this.size - 1, this.position, v1, this.diameter*2/3);
    var Asteroid2 = new Asteroid(this.level, this.canvas, this.size - 1, this.position, v2, this.diameter*2/3);
    asteroids.push(Asteroid1);
    asteroids.push(Asteroid2);
  }
}

//Asteroids bump into each other
Asteroid.prototype.collide = function(asteroids) {
  this.collisionCounter = minCollision;
}


//Keeps asteroid up to date
Asteroid.prototype.update = function(time) {
  this.collisionCounter -= time;
  if(this.state == 'default'){
    this.angle -= this.angularVelocity;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if(this.position.x < -1 * this.diameter) this.position.x = this.worldWidth;
    if(this.position.x > this.worldWidth) this.position.x = -1 * this.diameter;
    if(this.position.y < -1 * this.diameter) this.position.y = this.worldHeight;
    if(this.position.y > this.worldHeight) this.position.y = -1 * this.diameter;
  }
  else if(this.state == 'death'){
    if(this.explosionFrame < 16)
      this.explosionFrame ++;
    else
      this.remove = true;
  }
}

//Draws the Asteroid
Asteroid.prototype.render = function(time, ctx) {
  if(this.state == 'default'){
	ctx.globalAlpha = 1;
	ctx.fillStyle = '#996633';
    ctx.save();
	ctx.beginPath();
	ctx.arc(this.position.x, this.position.y, this.diameter/2, 0 , Math.PI * 2);
	ctx.fill();
    ctx.restore();
  }
  else if(this.state == 'death'){
    ctx.strokeStyle = "#ff0000";
	ctx.beginPath(); 
    ctx.moveTo(this.position.x + 5*this.size,this.position.y + 5*this.size);
    ctx.lineTo(this.position.x + 12*this.size,this.position.y + 15);
    ctx.lineTo(this.position.x,this.position.y + 18*this.size); 
    ctx.lineTo(this.position.x + 12*this.size,this.position.y + 21*this.size);
    ctx.lineTo(this.position.x + 5*this.size,this.position.y + 31*this.size);  
    ctx.lineTo(this.position.x + 16*this.size,this.position.y + 25*this.size);
    ctx.lineTo(this.position.x + 19*this.size,this.position.y + 37*this.size);
    ctx.lineTo(this.position.x + 22*this.size,this.position.y + 25*this.size);
    ctx.lineTo(this.position.x + 33*this.size,this.position.y + 31*this.size);
    ctx.lineTo(this.position.x + 26*this.size,this.position.y + 21*this.size);
    ctx.lineTo(this.position.x + 38*this.size,this.position.y + 18*this.size);
    ctx.closePath();
    ctx.stroke();
  }
}
