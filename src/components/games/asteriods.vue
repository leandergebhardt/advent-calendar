<template>
  <div class="game-container">
    <canvas ref="canvas" @touchstart.prevent @touchmove.prevent @touchend.prevent></canvas>
    
    <div class="hud">
      <div class="score">Score: {{ score }}</div>
      <div class="lives">Lives: {{ lives }}</div>
    </div>

    <div v-if="gameOver" class="game-over">
      <h2>Game Over</h2>
      <p>Final Score: {{ score }}</p>
      <button @click="restart">Play Again</button>
    </div>

    <div class="controls">
      <div class="left-controls">
        <button @touchstart="startRotateLeft" @touchend="stopRotate" class="control-btn rotate-left">↺</button>
        <button @touchstart="startRotateRight" @touchend="stopRotate" class="control-btn rotate-right">↻</button>
      </div>
      <div class="right-controls">
        <button @touchstart="startThrust" @touchend="stopThrust" class="control-btn thrust">▲</button>
        <button @touchstart="shoot" class="control-btn shoot">●</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      canvas: null,
      ctx: null,
      ship: null,
      asteroids: [],
      bullets: [],
      score: 0,
      lives: 3,
      gameOver: false,
      rotating: 0,
      thrusting: false,
      animationId: null
    };
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    this.init();
    this.gameLoop();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCanvas);
    if (this.animationId) cancelAnimationFrame(this.animationId);
  },
  methods: {
    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    init() {
      this.ship = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        angle: 0,
        vx: 0,
        vy: 0,
        size: 15
      };
      this.asteroids = [];
      this.bullets = [];
      this.spawnAsteroids(4);
    },
    spawnAsteroids(count) {
      for (let i = 0; i < count; i++) {
        const size = 40;
        let x, y;
        do {
          x = Math.random() * this.canvas.width;
          y = Math.random() * this.canvas.height;
        } while (this.distance(x, y, this.ship.x, this.ship.y) < 100);
        
        this.asteroids.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size,
          level: 3
        });
      }
    },
    distance(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    startRotateLeft() {
      this.rotating = -1;
    },
    startRotateRight() {
      this.rotating = 1;
    },
    stopRotate() {
      this.rotating = 0;
    },
    startThrust() {
      this.thrusting = true;
    },
    stopThrust() {
      this.thrusting = false;
    },
    shoot() {
      if (this.gameOver) return;
      const speed = 8;
      this.bullets.push({
        x: this.ship.x + Math.cos(this.ship.angle) * this.ship.size,
        y: this.ship.y + Math.sin(this.ship.angle) * this.ship.size,
        vx: Math.cos(this.ship.angle) * speed + this.ship.vx,
        vy: Math.sin(this.ship.angle) * speed + this.ship.vy,
        life: 60
      });
    },
    update() {
      if (this.gameOver) return;

      // Rotate ship
      this.ship.angle += this.rotating * 0.1;

      // Thrust
      if (this.thrusting) {
        this.ship.vx += Math.cos(this.ship.angle) * 0.15;
        this.ship.vy += Math.sin(this.ship.angle) * 0.15;
      }

      // Apply friction
      this.ship.vx *= 0.99;
      this.ship.vy *= 0.99;

      // Update ship position
      this.ship.x += this.ship.vx;
      this.ship.y += this.ship.vy;

      // Wrap ship
      if (this.ship.x < 0) this.ship.x = this.canvas.width;
      if (this.ship.x > this.canvas.width) this.ship.x = 0;
      if (this.ship.y < 0) this.ship.y = this.canvas.height;
      if (this.ship.y > this.canvas.height) this.ship.y = 0;

      // Update asteroids
      this.asteroids.forEach(a => {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0) a.x = this.canvas.width;
        if (a.x > this.canvas.width) a.x = 0;
        if (a.y < 0) a.y = this.canvas.height;
        if (a.y > this.canvas.height) a.y = 0;
      });

      // Update bullets
      this.bullets = this.bullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.life--;
        return b.life > 0 && b.x > 0 && b.x < this.canvas.width && b.y > 0 && b.y < this.canvas.height;
      });

      // Collision detection
      this.bullets.forEach((b, bi) => {
        this.asteroids.forEach((a, ai) => {
          if (this.distance(b.x, b.y, a.x, a.y) < a.size) {
            this.bullets.splice(bi, 1);
            this.asteroids.splice(ai, 1);
            this.score += 10;
            
            if (a.level > 1) {
              for (let i = 0; i < 2; i++) {
                this.asteroids.push({
                  x: a.x,
                  y: a.y,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  size: a.size / 2,
                  level: a.level - 1
                });
              }
            }
          }
        });
      });

      // Ship collision
      this.asteroids.forEach((a, ai) => {
        if (this.distance(this.ship.x, this.ship.y, a.x, a.y) < this.ship.size + a.size) {
          this.lives--;
          this.asteroids.splice(ai, 1);
          this.ship.x = this.canvas.width / 2;
          this.ship.y = this.canvas.height / 2;
          this.ship.vx = 0;
          this.ship.vy = 0;
          
          if (this.lives <= 0) {
            this.gameOver = true;
          }
        }
      });

      // Spawn new asteroids
      if (this.asteroids.length === 0) {
        this.spawnAsteroids(Math.min(10, 4 + Math.floor(this.score / 100)));
      }
    },
    draw() {
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;

      // Draw ship
      this.ctx.save();
      this.ctx.translate(this.ship.x, this.ship.y);
      this.ctx.rotate(this.ship.angle);
      this.ctx.beginPath();
      this.ctx.moveTo(this.ship.size, 0);
      this.ctx.lineTo(-this.ship.size, -this.ship.size / 2);
      this.ctx.lineTo(-this.ship.size / 2, 0);
      this.ctx.lineTo(-this.ship.size, this.ship.size / 2);
      this.ctx.closePath();
      this.ctx.stroke();
      
      if (this.thrusting) {
        this.ctx.beginPath();
        this.ctx.moveTo(-this.ship.size / 2, 0);
        this.ctx.lineTo(-this.ship.size * 1.5, 0);
        this.ctx.stroke();
      }
      this.ctx.restore();

      // Draw asteroids
      this.asteroids.forEach(a => {
        this.ctx.beginPath();
        this.ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        this.ctx.stroke();
      });

      // Draw bullets
      this.ctx.fillStyle = '#fff';
      this.bullets.forEach(b => {
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      });
    },
    gameLoop() {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(this.gameLoop);
    },
    restart() {
      this.score = 0;
      this.lives = 3;
      this.gameOver = false;
      this.rotating = 0;
      this.thrusting = false;
      this.init();
    }
  }
};
</script>

<style scoped>
.game-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
  touch-action: none;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.hud {
  position: absolute;
  top: 20px;
  left: 20px;
  color: #fff;
  font-family: monospace;
  font-size: 20px;
  z-index: 10;
  pointer-events: none;
}

.score, .lives {
  margin: 5px 0;
}

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid #fff;
  padding: 30px;
  text-align: center;
  color: #fff;
  font-family: monospace;
  z-index: 20;
}

.game-over h2 {
  margin: 0 0 15px 0;
  font-size: 32px;
}

.game-over p {
  margin: 15px 0;
  font-size: 20px;
}

.game-over button {
  background: #fff;
  color: #000;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  font-family: monospace;
  cursor: pointer;
  margin-top: 10px;
}

.controls {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 30px;
  z-index: 10;
}

.left-controls, .right-controls {
  display: flex;
  gap: 15px;
}

.control-btn {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid #fff;
  border-radius: 50%;
  color: #fff;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.control-btn:active {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 600px) {
  .control-btn {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
  
  .controls {
    padding: 0 20px;
    bottom: 20px;
  }
}
</style>