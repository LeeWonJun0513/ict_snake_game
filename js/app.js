var Server = require('./server.js').Server,
    Snake = require('./snake.js').Snake,
    Bonus = require('./bonus.js').Bonus,
    io = require('socket.io'),
    _ = require('underscore');

var snakes = {};
var bonuses = [];


var port = process.env.PORT || 5000;
var server = new Server({
    port: port,
    snakes: snakes,
    bonuses: bonuses,
});

server.em.addListener('player:connect', function(playerId) {
    console.log('Player #' + playerId + ' connected');
    var snake = new Snake(playerId);
    snakes[playerId] = snake;
    server.updateScoreBoard();
});
server.em.addListener('player:disconnect', function(playerId) {
    console.log('Player #' + playerId + ' disconnected');
    delete snakes[playerId];
    server.updateScoreBoard();
});
server.em.addListener('player:direction:change', function(playerId, direction) {
    snakes[playerId].setDirection(direction);
});

(function makeBonuses() {
    for (var i = 0; i < 5; i++) {
        bonuses.push(new Bonus());
    }
})();


var update = function() {
    for (var i in snakes) {
        snakes[i].step();
    }
    checkCollisions();
    server.update();
};
var tick = setInterval(update, 100);

function checkCollisions() {

    var deads = [];
    var scoreboardNeedUpdate = false;

    _(snakes).each(function(snake) {
        _(bonuses).each(function(bonus, index) {
            if (snake.collideWith(bonus)) {
                bonuses[index] = new Bonus();
                snake.grow();
                scoreboardNeedUpdate = true;
            }
        });
        if (snake.collideWithSelf()) {
            deads.push(snake);
            scoreboardNeedUpdate = true;
        }
        _(snakes).each(function(other) {
            if (other !== snake && other.collideWithSnake(snake)) {
                deads.push(other);
                snake.onKill();
                scoreboardNeedUpdate = true;
            }
        });
    });

    _(deads).invoke('onDie');

    if (scoreboardNeedUpdate) server.updateScoreBoard();
}

server.start();
