require([], function () {
  var SPRITE_PLAYER = 1;
  var SPRITE_BULLET = 2;  

  Q.Sprite.extend('Actor', {
    init: function (p) {
      this._super(p, {
        update: true
      });

      var temp = this;
      setInterval(function () {
        if (!temp.p.update) {
          temp.destroy();
        }
        temp.p.update = false;
      }, 3000);
    } 
  });

  Q.Sprite.extend('Player', {
    init: function (p) {
      this._super(p, {
        sheet: 'player',
        tagged: false,
        invincible: false,
        vyMult: 1,
        type: SPRITE_PLAYER,
        health: 100
      });

      this.add('2d, platformerControls, animation');
      Q.input.on("fire", this, "shoot");
      this.addEventListeners();
    },
    addEventListeners: function () {
      
      this.on('hit', function(col){
          if (col.obj.isA("Bullet")) {
              col.obj.destroy();
              this.p.health -= 10;                            
              if (this.p.health <= 0){
                this.destroy();                
              }              
          }                
      });      
    },

    step: function (dt) {
      if (Q.inputs['up']) {
        this.p.vy = -200 * this.p.vyMult;
      } else if (Q.inputs['down']) {
        this.p.vy = 200 * this.p.vyMult;
      } else if (!Q.inputs['down'] && !Q.inputs['up']) {
        this.p.vy = 0;
      }
      this.p.socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet, opacity: this.p.opacity, invincible: this.p.invincible, tagged: this.p.tagged });
    },

    shoot: function() {        
        var p = this.p;
        this.stage.insert(new Q.Bullet({
            x: p.x,
            y: p.y - p.w,
            vy: -400
        }))
    }
  });

  Q.MovingSprite.extend("Bullet", {
      init: function(p) {
          this._super(p, {
              sheet: "bullet",
              //sprite: "enemy",
              type: SPRITE_BULLET,
              collisionMask: SPRITE_PLAYER,
              sensor: true,
              prevY: 0
          });
          this.add("2d");
      },
      
      step: function(dt) {
          if (this.p.y  == this.prevY) {
              this.destroy();
          }
          this.prevY = this.p.y;
      }
  });
});
