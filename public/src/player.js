require([], function () {
  var SPRITE_PLAYER = 1;
  var SPRITE_BULLET = 2;

  var UP = "up";
  var DOWN = "down";  

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
    },

    addEventListeners: function () {
      
      this.on('hit', function(col){
        if (this.p.bullet == col.obj) {
          return;
        }
          if (col.obj.isA("Bullet")) {
              col.obj.destroy();
              this.p.health -= 10;                            
              if (this.p.health <= 0){
                this.destroy();                
              }              
          }                
      });      
    },

  });

  Q.Sprite.extend('Player', {
    init: function (p) {
      this._super(p, {
        sheet: 'tank_up',
        tagged: false,
        invincible: false,
        vyMult: 1,
        type: SPRITE_PLAYER,
        health: 100,        
      });

      this.add('2d, platformerControls, animation');
      Q.input.on("fire", this, "shoot");
      this.addEventListeners();
    },
    addEventListeners: function () {
      
      this.on('hit', function(col){
        if (this.p.bullet == col.obj) {
          return;
        }
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
        this.p.direction = UP;
      } else if (Q.inputs['down']) {
        this.p.vy = 200 * this.p.vyMult;
        this.p.direction = DOWN;
      } else if (!Q.inputs['down'] && !Q.inputs['up']) {
        this.p.vy = 0;
      }
      
      switch (this.p.direction){
          case "up":
          this.p.sheet = "tank_up";
          break;          
          case "down":
          this.p.sheet = "tank_down";
          break;
          case "left":
          this.p.sheet = "tank_left";
          break;
          case "right":
          this.p.sheet = "tank_right";
          break
        }

      this.p.socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet, opacity: this.p.opacity, invincible: this.p.invincible, tagged: this.p.tagged });
    },

    shoot: function() {        
        var p = this.p;
        var speed = 400;
        var newVx = 0;
        var newVy = 0;
        var newPx = 0;
        var newPy = 0;

        switch (this.p.direction){
          case "up":
            newVy = speed * (-1);
            newPy = -p.w/2;
          break;          
          case "down":
            newVy = speed;
            newPy = p.w/2;
          break;
          case "left":
            newVx = speed * (-1);
            newPx = -p.h/2;
          break;
          case "right":
            newVx = speed;            
            newPx = p.h/2;
          break
        }
        
        var bullet = new Q.Bullet({
            x: p.x + newPx,
            y: p.y + newPy,
            vy: newVy,
            vx: newVx,
            owner: p
        });
        this.p.bullet = bullet;
        this.p.socket.emit('send-bullet', { bulletX: bullet.p.x, bulletY: bullet.p.y, bulletVx: bullet.p.vx, bulletVy: bullet.p.vy});        
        this.stage.insert(bullet);
    }
  });

  Q.MovingSprite.extend("Bullet", {
      init: function(p) {
          this._super(p, {
              sheet: "bullet",              
              type: SPRITE_BULLET,
              collisionMask: SPRITE_PLAYER,
              sensor: true,
              prevY: 0,
              prevX: 0,
              owner: null
          });
          this.add("2d");
      },
      
      step: function(dt) {
        if (this.p.y  == this.prevY && this.p.x  == this.prevX) {
              this.destroy();
          }
          this.prevY = this.p.y;
          this.prevX = this.p.x;
      }
  });
});
