var canvas = new Object();
var mainSnake;
var food;


canvas.element = document.getElementById('canvas');
canvas.context = canvas.element.getContext('2d');
canvas.width = canvas.element.getAttribute('width');
canvas.height = canvas.element.getAttribute('height');
canvas.cellWidth = 15;

//redraw the canvas on updates
canvas.redraw = function(fillColor, strokeColor){
	// Add default canvas color options
	var fillColor = fillColor || 'white',
		strokeColor = strokeColor || 'black';

	this.paint(0, 0, fillColor, strokeColor, this.width, this.height);
}

canvas.paint = function(x, y, fillColor, strokeColor, width, height) {
	var width = width || this.cellWidth,
		height = height || this.cellWidth,
		fillColor = fillColor || 'red',
		strokeColor = strokeColor || 'white';

	this.context.fillStyle = fillColor;
	this.context.fillRect(x*canvas.cellWidth, y*canvas.cellWidth, width, height);
	this.context.strokeStyle = strokeColor;
	this.context.strokeRect(x*canvas.cellWidth, y*canvas.cellWidth, width, height);
};

//this changes the location of "score" on the map
canvas.paintText = function(text, x, y) {
	var x = x || 20,
		y = y || 640;
	this.context.fillText(text, x, y);
};

canvas.redraw();

//create a snake
function Snake(length, bodyColor, outlineColor, startingPos) {
	this.length = length;
	this.bodyColor = bodyColor;
	this.outlineColor = outlineColor;
	this.array = [];
	this.direction = 'right';
	this.nd = []; // Next direction
	this.nx; // Next x pos
	this.ny; // Next y pos
	
	var startingPos = startingPos;
	this.create = function(){
		for(var i = this.length-1; i>=0; i--) {
			this.array.push({x: startingPos.x + i, y: startingPos.y});
		}
	};
	this.create();
}

Snake.prototype.move = function() {
	if (this.nd.length) {
		this.direction = this.nd.shift();
	}

	this.nx = this.array[0].x;
	this.ny = this.array[0].y;
	var tail;

	switch(this.direction) {
		case 'right':
			this.nx++;
			break;
		case 'left':
			this.nx--;
			break;
		case 'up':
			this.ny--;
			break;
		case 'down':
			this.ny++;
			break;
	}

	if(this.outsideBounds() || this.colliding()) {
		game.over();
		return;
	}

	if(this.eatingFood()) {
		game.score++;
		tail = {x: this.nx, y: this.ny};
		food = new Food();
	} else {
		var tail = this.array.pop();
		tail.x = this.nx;
		tail.y = this.ny;
	}

	this.array.unshift(tail);

	this.paint();
}

Snake.prototype.paint = function() {
	canvas.redraw();
	for(var i = 0; i < this.array.length; i++) {
		// The current snake body element
		var j = this.array[i];

		canvas.paint(j.x, j.y, this.bodyColor, this.outlineColor);
	}
}

Snake.prototype.outsideBounds = function() {
	if(this.nx <= -1 || this.nx === canvas.width/canvas.cellWidth || this.ny <= -1 || this.ny === canvas.height/canvas.cellWidth) {
		return true;
	}
	return false;
}

Snake.prototype.eatingFood = function() {
	if(this.nx === food.x && this.ny === food.y) {
		return true;
	}
	return false;
}

Snake.prototype.colliding = function(x, y) {
	// Default to checking body collision
	var x = x || this.nx,
		y = y || this.ny;
	for(var i = 0; i < this.array.length; i++) {
		if(this.array[i].x === x && this.array[i].y === y) {
			
			return true;
		}
	}
	return false;
}

//snake food
function Food() {
	this.generateCoords = function() {
		this.x = Math.round(Math.random() * (canvas.width-canvas.cellWidth)/canvas.cellWidth);
		this.y = Math.round(Math.random() * (canvas.height-canvas.cellWidth)/canvas.cellWidth);
		this.checkCollision();
	};
	this.checkCollision = function() {
		if(mainSnake.colliding(this.x, this.y)) {
			this.generateCoords();
		}
	};
	this.draw = function(){
		canvas.paint(this.x, this.y, 'green');
	};

	this.generateCoords();
	this.checkCollision();
	this.draw();

}

//game initialized
var game = new Object();
game.fps = 15;
game.score = 0;
game.scoreText = 'Score: ';
game.drawScore = function() {
	canvas.paintText(this.scoreText + this.score);
};
game.runLoop = function(){
	setTimeout(function() {
        requestAnimationFrame(game.runLoop);
		mainSnake.move();
		if(typeof food.draw != 'undefined') {
			food.draw();
		}
		game.drawScore();
    }, 1000 / game.fps);
};
game.start = function() {
	mainSnake = new Snake(5, 'blue', 'blue', {x: 5, y: 20});
	food = new Food();
	game.score = 0;
};
game.over = function(){
	alert("Game over. Your score was: " + game.score);
	canvas.redraw();
	this.start();
};

game.start();
game.runLoop();

//key operations
document.onkeydown = function(e) {
	if(typeof mainSnake !== 'undefined'){
		var key = (e.keyCode ? e.keyCode : e.which);
		var td;
		if (mainSnake.nd.length) {
			td = mainSnake.nd[mainSnake.nd.length - 1];
		} else {
			td = mainSnake.direction;
		}
		if(key == "37" && mainSnake.direction != 'right') {
			mainSnake.nd.push('left');
		} else if(key == "38" && mainSnake.direction != 'down') {
			mainSnake.nd.push('up');
		} else if(key == "39" && mainSnake.direction != 'left') {
			mainSnake.nd.push('right');
		} else if(key == "40" && mainSnake.direction != 'up') {
			mainSnake.nd.push('down');
		}
	}
}

