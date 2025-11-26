<template>
  <div class="game-container">
    <canvas ref="canvas" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd"></canvas>
    
    <div v-if="!gameStarted" class="start-screen">
      <h1 class="title">SPACE INVADERS</h1>
      <p class="highscore">HIGH SCORE: {{ highScore }}</p>
      <button @click="startGame" class="start-btn">START GAME</button>
    </div>
    
    <div v-if="gameOver" class="game-over-screen">
      <h2 class="game-over-title">GAME OVER</h2>
      <p class="final-score">SCORE: {{ score }}</p>
      <p v-if="score === highScore && score > 0" class="new-high">NEW HIGH SCORE!</p>
      <button @click="restartGame" class="restart-btn">PLAY AGAIN</button>
    </div>
    
    <div v-if="gameStarted && !gameOver" class="hud">
      <div class="score">SCORE: {{ score }}</div>
      <div class="lives">LIVES: {{ lives }}</div>
    </div>
    
    <div v-if="gameStarted && !gameOver" class="mobile-controls">
      <button @touchstart.prevent="moveLeft" @touchend.prevent="stopMove" class="control-btn left-btn">◄</button>
      <button @touchstart.prevent="shoot" class="control-btn fire-btn">FIRE</button>
      <button @touchstart.prevent="moveRight" @touchend.prevent="stopMove" class="control-btn right-btn">►</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      canvas: null,
      ctx: null,
      gameStarted: false,
      gameOver: false,
      score: 0,
      highScore: 0,
      lives: 3,
      player: { x: 0, y: 0, width: 40, height: 30, speed: 3 },
      bullets: [],
      enemies: [],
      enemyBullets: [],
      keys: {},
      moveDirection: 0,
      animationId: null,
      enemyDirection: 1,
      enemySpeed: 0.5,
      enemyDropDistance: 15,
      lastEnemyShot: 0,
      touchStartX: 0
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.loadHighScore();
    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height - 80;
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCanvas);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  },
  methods: {
    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      if (this.gameStarted) {
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - 80;
      }
    },
    loadHighScore() {
      const saved = localStorage.getItem('spaceInvadersHighScore');
      if (saved) {
        this.highScore = parseInt(saved);
      }
    },
    saveHighScore() {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('spaceInvadersHighScore', this.highScore.toString());
      }
    },
    startGame() {
      this.gameStarted = true;
      this.gameOver = false;
      this.score = 0;
      this.lives = 3;
      this.bullets = [];
      this.enemyBullets = [];
      this.enemyDirection = 1;
      this.enemySpeed = 0.5;
      this.lastEnemyShot = Date.now();
      this.player.x = this.canvas.width / 2 - this.player.width / 2;
      this.player.y = this.canvas.height - 80;
      this.initEnemies();
      this.gameLoop();
    },
    restartGame() {
      this.startGame();
    },
    initEnemies() {
      this.enemies = [];
      const rows = 4;
      const cols = 8;
      const enemyWidth = 35;
      const enemyHeight = 30;
      const spacing = 50;
      const startX = (this.canvas.width - cols * spacing) / 2;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          this.enemies.push({
            x: startX + col * spacing,
            y: 50 + row * 40,
            width: enemyWidth,
            height: enemyHeight,
            color: this.getEnemyColor(row)
          });
        }
      }
    },
    getEnemyColor(row) {
      const colors = ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec'];
      return colors[row % colors.length];
    },
    handleKeyDown(e) {
      this.keys[e.key] = true;
      if (e.key === ' ' && this.gameStarted && !this.gameOver) {
        this.shoot();
        e.preventDefault();
      }
    },
    handleKeyUp(e) {
      this.keys[e.key] = false;
    },
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
    },
    handleTouchMove(e) {
      if (!this.gameStarted || this.gameOver) return;
      const touchX = e.touches[0].clientX;
      const rect = this.canvas.getBoundingClientRect();
      this.player.x = touchX - rect.left - this.player.width / 2;
      this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    },
    handleTouchEnd() {
      this.touchStartX = 0;
    },
    moveLeft() {
      this.moveDirection = -1;
    },
    moveRight() {
      this.moveDirection = 1;
    },
    stopMove() {
      this.moveDirection = 0;
    },
    shoot() {
      if (this.bullets.length < 3) {
        this.bullets.push({
          x: this.player.x + this.player.width / 2 - 2,
          y: this.player.y,
          width: 4,
          height: 15,
          speed: 5
        });
      }
    },
    gameLoop() {
      if (this.gameOver) return;
      
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(this.gameLoop);
    },
    update() {
      // Player movement
      if (this.keys['ArrowLeft'] || this.keys['a']) {
        this.player.x -= this.player.speed;
      }
      if (this.keys['ArrowRight'] || this.keys['d']) {
        this.player.x += this.player.speed;
      }
      
      // Mobile controls
      if (this.moveDirection !== 0) {
        this.player.x += this.moveDirection * this.player.speed;
      }
      
      this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
      
      // Update bullets
      this.bullets = this.bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > 0;
      });
      
      // Update enemy bullets
      this.enemyBullets = this.enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y < this.canvas.height;
      });
      
      // Move enemies
      let shouldDrop = false;
      for (let enemy of this.enemies) {
        enemy.x += this.enemyDirection * this.enemySpeed;
        if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width) {
          shouldDrop = true;
        }
      }
      
      if (shouldDrop) {
        this.enemyDirection *= -1;
        for (let enemy of this.enemies) {
          enemy.y += this.enemyDropDistance;
        }
      }
      
      // Enemy shooting
      if (Date.now() - this.lastEnemyShot > 1000 && this.enemies.length > 0) {
        const shooter = this.enemies[Math.floor(Math.random() * this.enemies.length)];
        this.enemyBullets.push({
          x: shooter.x + shooter.width / 2 - 2,
          y: shooter.y + shooter.height,
          width: 4,
          height: 15,
          speed: 3
        });
        this.lastEnemyShot = Date.now();
      }
      
      // Collision detection - bullets vs enemies
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (this.checkCollision(bullet, enemy)) {
            this.bullets.splice(i, 1);
            this.enemies.splice(j, 1);
            this.score += 10;
            break;
          }
        }
      }
      
      // Collision detection - enemy bullets vs player
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = this.enemyBullets[i];
        if (this.checkCollision(bullet, this.player)) {
          this.enemyBullets.splice(i, 1);
          this.lives--;
          if (this.lives <= 0) {
            this.endGame();
          }
        }
      }
      
      // Check if enemies reached player (with safer distance check)
      for (let enemy of this.enemies) {
        if (enemy.y + enemy.height >= this.player.y - 20) {
          this.endGame();
          break;
        }
      }
      
      // Check if all enemies destroyed
      if (this.enemies.length === 0) {
        this.enemySpeed += 0.3;
        this.initEnemies();
      }
    },
    checkCollision(rect1, rect2) {
      return rect1.x < rect2.x + rect2.width &&
             rect1.x + rect1.width > rect2.x &&
             rect1.y < rect2.y + rect2.height &&
             rect1.y + rect1.height > rect2.y;
    },
    draw() {
      // Background
      this.ctx.fillStyle = '#0a0e27';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Stars
      this.ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 37) % this.canvas.width;
        const y = (i * 53) % this.canvas.height;
        this.ctx.fillRect(x, y, 2, 2);
      }
      
      // Draw player
      this.drawPlayer();
      
      // Draw bullets
      this.ctx.fillStyle = '#00ff41';
      for (let bullet of this.bullets) {
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
      
      // Draw enemy bullets
      this.ctx.fillStyle = '#ff006e';
      for (let bullet of this.enemyBullets) {
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
      
      // Draw enemies
      for (let enemy of this.enemies) {
        this.drawEnemy(enemy);
      }
    },
    drawPlayer() {
      this.ctx.fillStyle = '#00d9ff';
      this.ctx.fillRect(this.player.x + 10, this.player.y, 20, 20);
      this.ctx.fillStyle = '#00ff41';
      this.ctx.fillRect(this.player.x, this.player.y + 20, 40, 10);
      this.ctx.fillStyle = '#ffbe0b';
      this.ctx.fillRect(this.player.x + 15, this.player.y + 5, 10, 10);
    },
    drawEnemy(enemy) {
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(enemy.x + 8, enemy.y + 8, 8, 8);
      this.ctx.fillRect(enemy.x + 19, enemy.y + 8, 8, 8);
    },
    endGame() {
      this.gameOver = true;
      this.saveHighScore();
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }
}
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Courier New', monospace;
  box-sizing: border-box;
}

canvas {
  display: block;
  width: 100vw;
  height: 100vh;
  border: none;
  background: #0a0e27;
}

.start-screen, .game-over-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(10, 14, 39, 0.95);
  padding: 40px;
  border-radius: 20px;
  border: 3px solid #00ff41;
  box-shadow: 0 0 40px rgba(0, 255, 65, 0.6);
  z-index: 10;
}

.title {
  font-size: 3em;
  color: #00ff41;
  margin: 0 0 20px 0;
  text-shadow: 0 0 20px rgba(0, 255, 65, 0.8);
}

.game-over-title {
  font-size: 2.5em;
  color: #ff006e;
  margin: 0 0 20px 0;
  text-shadow: 0 0 20px rgba(255, 0, 110, 0.8);
}

.highscore, .final-score {
  font-size: 1.5em;
  color: #ffbe0b;
  margin: 10px 0;
}

.new-high {
  font-size: 1.3em;
  color: #00ff41;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.start-btn, .restart-btn {
  font-size: 1.5em;
  padding: 15px 40px;
  margin-top: 20px;
  background: #00ff41;
  color: #0a0e27;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.start-btn:hover, .restart-btn:hover {
  background: #00d9ff;
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(0, 255, 65, 0.8);
}

.hud {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 40px;
  font-size: 1.5em;
  color: #00ff41;
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.8);
  z-index: 5;
}

.mobile-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 5;
}

.control-btn {
  width: 70px;
  height: 70px;
  font-size: 1.5em;
  background: rgba(0, 255, 65, 0.3);
  color: #00ff41;
  border: 3px solid #00ff41;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
  touch-action: manipulation;
}

.fire-btn {
  background: rgba(255, 0, 110, 0.3);
  border-color: #ff006e;
  color: #ff006e;
  width: 90px;
  height: 90px;
  font-size: 1.2em;
}

.control-btn:active {
  transform: scale(0.9);
  box-shadow: 0 0 20px currentColor;
}

@media (max-width: 600px) {
  .title {
    font-size: 2em;
  }
  
  .hud {
    font-size: 1.2em;
    gap: 20px;
  }
  
  .control-btn {
    width: 60px;
    height: 60px;
  }
  
  .fire-btn {
    width: 75px;
    height: 75px;
  }
}
</style>