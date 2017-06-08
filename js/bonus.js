exports.Bonus = Bonus = function() {
    this.STAGE_WIDTH  = 25;
    this.STAGE_HEIGHT = 25;

    // init
    this.x = Math.floor(Math.random() * (this.STAGE_WIDTH - 1));
    this.y = Math.floor(Math.random() * (this.STAGE_HEIGHT - 1));
};
