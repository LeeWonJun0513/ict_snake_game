exports.Snake = Snake = function(playerId) {
    this.SNAKE_LENGTH = 6;
    this.STAGE_WIDTH  = 25;
    this.STAGE_HEIGHT = 25;

    this.playerId = playerId;
    this.kills = 0;
    this.deaths = 0;
    this.score = 0;

    this.reset();
};

Snake.prototype.onDie = function() {
    this.deaths++;
    this.reset();
};

Snake.prototype.onKill = function() {
    this.kills++;
    this.score += 42;
};

Snake.prototype.reset = function() {
    this.elements = [];
    this.direction = this.nextDirection = 'right';

    var y = Math.floor(Math.random() * this.STAGE_WIDTH);
    for (var i = this.SNAKE_LENGTH - 1; i >= 0; i--) {
        this.elements[i] = { x: -i, y: y };
    }
    this.head = this.elements[0];
    this.tail = this.elements[this.elements.length -1];

    this.score = 0;
};

Snake.prototype.grow = function() {
    var elements = this.elements,
        moveFrom = elements.indexOf(this.tail),
        lastIndex = elements.length - 1;

    if (moveFrom !== lastIndex) {
        for (var i = lastIndex; i > moveFrom; i--) {
            elements[i + 1] = elements[i];
        }
    }
    this.tail = elements[moveFrom + 1] = { x: this.lastTailX, y: this.lastTailY };

    this.score += 27;
};

Snake.prototype.step = function() {
    this.direction = this.nextDirection;
    
    var newTail = this.findNewTail(this.tail);

    this.lastTailX = this.tail.x;
    this.lastTailY = this.tail.y;

    this.tail.x = (this.head.x + this.dx[this.direction] + this.STAGE_HEIGHT) % this.STAGE_HEIGHT;
    this.tail.y = (this.head.y + this.dy[this.direction] + this.STAGE_WIDTH) % this.STAGE_WIDTH;

    this.head = this.tail;
    this.tail = newTail;
};

Snake.prototype.findNewTail = function(currentTail) {
    var elements = this.elements,
        currentTailIndex = elements.indexOf(currentTail);
    var tailIndex = (currentTailIndex + elements.length - 1) % elements.length;
    return elements[tailIndex];
};

Snake.prototype.directions = ['right', 'left', 'up', 'down'];
Snake.prototype.dx = {
    right: 1,
    left: -1,
    up: 0,
    down: 0
};
Snake.prototype.dy = {
    right: 0,
    left: 0,
    up: -1,
    down: 1
};
Snake.prototype.opposite = {
    right: 'left',
    left: 'right',
    up: 'down',
    down: 'up'
};

Snake.prototype.setDirection = function(direction) {
    if (this.opposite[direction] === this.direction) return;
    this.nextDirection = direction;
};

Snake.prototype.collideWith = function(bonus) {
    return (this.head.x === bonus.x && this.head.y === bonus.y);
};

Snake.prototype.collideWithSelf = function() {
    return this.collideWithSnake(this);
};

Snake.prototype.collideWithSnake = function(other) {
    var head = this.head;
    var elements = other.elements;
    for (var i = 0, l = elements.length; i < l; i++) {
        var element = elements[i];
        if (head !== element && head.x === element.x && head.y === element.y)
            return true;
    }
    return false;
};
