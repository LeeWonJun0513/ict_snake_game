(function($) {

    var $stage,
        context,
        $scoreboard,
        server,
        snakeId,
        STAGE_WIDTH  = 25,
        STAGE_HEIGHT = 25,
        BLOCK_WIDTH = 20,
        BLOCK_HEIGHT = 20;

    function connect() {
        server = io.connect(document.location.origin + '/snake');

        server.on('response', function(data) {
            snakeId = data.snakeId;
        });

        server.on('update', function(data) {
            renderSnakes(data.snakes);
            renderBonuses(data.bonuses);
            renderPortals(data.portals);
        });

        server.on('scoreboard:update', function(players) {
            renderScoreboard(players);
        });
    }

    function listenKeys() {
        var direction;

        $(document).keydown(function(e) {
            switch (e.keyCode) {
                case 37: // Left
                    direction = 'left';
                    break;
                case 38: // Up
                    direction = 'up';
                    break;
                case 39: // Right
                    direction = 'right';
                    break;
                case 40: // Down
                    direction = 'down';
                    break;
                default:
                    return;
            }
            e.preventDefault();
            server.emit('player:direction:request', direction);
        });
    }

    function renderSnakes(snakes) {

        renderGrid();

        for (var i in snakes) {
            var snake = snakes[i];
            var elements = snake.elements;
            if (snake.playerId === snakeId) {
                context.fillStyle = '#0ad14f';
            } else {
                context.fillStyle = '#d10a0a';
            }
            for (var j = 0, l = elements.length; j < l; j++) {
                var x = elements[j].x * BLOCK_WIDTH,
                    y = elements[j].y * BLOCK_HEIGHT;

                context.fillRect(x, y, BLOCK_WIDTH -1, BLOCK_HEIGHT -1);
            }
        }
    }

    function renderBonuses(bonuses) {
        bonuses.forEach(function(bonus) {
            context.fillStyle = '#12ea5a';
            var x = bonus.x * BLOCK_WIDTH,
                y = bonus.y * BLOCK_HEIGHT;
            context.fillRect(x, y, BLOCK_WIDTH -1, BLOCK_HEIGHT -1);
        });
    }

    function renderGrid() {
        context.fillStyle = '#04032d';
        for (var x = 0; x < STAGE_WIDTH; x++) {
            for (var y = 0; y < STAGE_HEIGHT; y++) {
                context.fillRect(x * BLOCK_WIDTH, y * BLOCK_HEIGHT,BLOCK_WIDTH -1, BLOCK_HEIGHT -1);
            }
        }
    }

    function renderScoreboard(players) {

        $scoreboard.empty();
        players.forEach(function(player) {
            $scoreboard.append(makeScoreboardRow(player));
        });
    }

    function makeScoreboardRow(player) {
 
        var ratio = typeof(player.ratio) === 'number' ?
            player.ratio.toFixed(2) :
            player.ratio;
        return '<tr>' +
            '<td>' + player.name   + '</td>' +
            '<td>' + player.kills  + '</td>' +
            '<td>' + player.deaths + '</td>' +
            '<td>' + player.score  + '</td>' +
            '</tr>';
    }
    
    $(document).ready(function() {
        $stage = $('#stage');
        context = $stage.get(0).getContext('2d');
        $scoreboard = $('#scoreboard > tbody');


        connect();
        listenKeys();
    });

})(window.jQuery);