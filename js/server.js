var express = require('express'),
    EventEmitter = require('events').EventEmitter,
    http = require('http'),
    io = require('socket.io'),
    _ = require('underscore');

exports.Server = Server = function(options) {
    this.clientId = 1;
    this.snakes = options.snakes;
    this.bonuses = options.bonuses;

    this.options = options;
    this.initialize(options);
};

Server.prototype.initialize = function(options) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.em = new EventEmitter();
    this.app.use(express.static(__dirname + '/../public'));
    
    this.setupSockets();
};

Server.prototype.start = function() {
    var port = this.options.port;
    this.server.listen(port);
    console.log('Listening on port: ' + port);
};

Server.prototype.setupSockets = function() {

    this.socket = io.listen(this.server);

    this.socket.configure(function() {
        this.socket.set('log level', 1);
    }.bind(this));

    this.socket.of('/snake').on('connection', function(client) {
        client.snakeId = this.clientId++;

        client.emit('response', { snakeId: client.snakeId });
        this.em.emit('player:connect', client.snakeId);

        client.on('player:direction:request', function(direction) {
            this.em.emit('player:direction:change', client.snakeId, direction);
        }.bind(this));

        client.on('disconnect', function() {
            this.em.emit('player:disconnect', client.snakeId);
        }.bind(this));

    }.bind(this));
};

Server.prototype.update = function() {
    this.socket.of('/snake').emit('update', {
        snakes: this.snakes,
        bonuses: this.bonuses,
        portals: this.portals
    });
};

Server.prototype.updateScoreBoard = function() {
    var players = _(this.snakes).map(function(item) {
        return {
            name:   item.playerId,
            kills:  item.kills,
            deaths: item.deaths,
            score:  item.score,
        };
    });
    players = _(players).sortBy(function(player) {
        return -player.score;
    });

    this.socket.of('/snake').emit('scoreboard:update', players);
};
