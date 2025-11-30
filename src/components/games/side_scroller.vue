<template>
  <div class="game-container">
    <canvas 
      ref="gameCanvas"
      @touchstart.prevent="handleJump"
      @mousedown.prevent="handleJump"
    />
    
    <!-- Start Screen -->
    <div v-if="!gameStarted" class="overlay">
      <div class="menu">
        <h1>❄️ Winter Runner ❄️</h1>
        <p>Tap to jump over obstacles!</p>
        <button @click="startGame" class="btn-start">START</button>
        <p class="high-score">High Score: {{ highScore }}</p>
      </div>
    </div>
    
    <!-- Game Over Screen -->
    <div v-if="gameOver" class="overlay">
      <div class="menu">
        <h1>Game Over!</h1>
        <p class="score">Score: {{ score }}</p>
        <p class="high-score-gold">High Score: {{ highScore }}</p>
        <button @click="startGame" class="btn-start">PLAY AGAIN</button>
      </div>
    </div>
    
    <!-- Score Display -->
    <div v-if="gameStarted && !gameOver" class="score-display">
      Score: {{ score }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'WinterRunner',
  data() {
    return {
      score: 0,
      highScore: 0,
      gameOver: false,
      gameStarted: false,
      animationFrameId: null,
      game: {
        player: { x: 100, y: 0, velocityY: 0, jumping: false, size: 32 },
        obstacles: [],
        background: { offset: 0 },
        speed: 3,
        gravity: 0.6,
        jumpPower: -12,
        groundY: 0,
        frameCount: 0,
        score: 0
      }
    }
  },
  mounted() {
    // Load high score from localStorage
    const saved = localStorage.getItem('winterRunnerHighScore');
    if (saved) {
      this.highScore = parseInt(saved);
    }
    
    // Setup canvas
    this.setupCanvas();
    window.addEventListener('resize', this.setupCanvas);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.setupCanvas);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },
  methods: {
    setupCanvas() {
      const canvas = this.$refs.gameCanvas;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.game.groundY = canvas.height - 60;
      }
    },
    
    startGame() {
      this.game = {
        player: { x: 100, y: 0, velocityY: 0, jumping: false, size: 32 },
        obstacles: [],
        background: { offset: 0 },
        speed: 3,
        gravity: 0.6,
        jumpPower: -12,
        groundY: this.$refs.gameCanvas.height - 60,
        frameCount: 0,
        score: 0
      };
      this.game.player.y = this.game.groundY - this.game.player.size;
      this.score = 0;
      this.gameOver = false;
      this.gameStarted = true;
      this.gameLoop();
    },
    
    handleJump() {
      if (this.gameStarted && !this.gameOver && !this.game.player.jumping) {
        this.game.player.jumping = true;
        this.game.player.velocityY = this.game.jumpPower;
      }
    },
    
    drawPixelRect(ctx, x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
    },
    
    drawPlayer(ctx) {
      const p = this.game.player;
      const animFrame = Math.floor(this.game.frameCount / 8) % 2;
      
      // Body (winter coat) - facing right
      this.drawPixelRect(ctx, p.x + 8, p.y + 8, 16, 16, '#4A90E2');
      // Head
      this.drawPixelRect(ctx, p.x + 12, p.y + 2, 12, 8, '#FFD4A3');
      // Hat
      this.drawPixelRect(ctx, p.x + 10, p.y, 16, 4, '#E74C3C');
      // Legs (animated) - facing right
      if (animFrame === 0) {
        this.drawPixelRect(ctx, p.x + 10, p.y + 24, 4, 8, '#2C3E50');
        this.drawPixelRect(ctx, p.x + 18, p.y + 24, 4, 8, '#2C3E50');
      } else {
        this.drawPixelRect(ctx, p.x + 12, p.y + 24, 4, 8, '#2C3E50');
        this.drawPixelRect(ctx, p.x + 16, p.y + 24, 4, 8, '#2C3E50');
      }
      // Scarf - facing right
      this.drawPixelRect(ctx, p.x + 16, p.y + 10, 8, 3, '#E74C3C');
    },
    
    drawBackground(ctx) {
      const canvas = this.$refs.gameCanvas;
      
      // Sky
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Snow mountains - moving left
      for (let i = 0; i < 5; i++) {
        const offset = (this.game.background.offset * 0.3 + i * 200) % (canvas.width + 200);
        ctx.fillStyle = '#E8F4F8';
        ctx.beginPath();
        ctx.moveTo(offset - 100, this.game.groundY);
        ctx.lineTo(offset, this.game.groundY - 80);
        ctx.lineTo(offset + 100, this.game.groundY);
        ctx.fill();
      }
      
      // Ground
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, this.game.groundY, canvas.width, canvas.height);
      
      // Snow texture - moving left
      ctx.fillStyle = '#F0F8FF';
      for (let i = 0; i < canvas.width + 40; i += 40) {
        const offset = ((i - this.game.background.offset) % (canvas.width + 40) + canvas.width + 40) % (canvas.width + 40);
        this.drawPixelRect(ctx, offset, this.game.groundY + 10, 8, 8, '#F0F8FF');
      }
    },
    
    drawObstacles(ctx) {
      this.game.obstacles.forEach(obs => {
        if (obs.type === 'car') {
          // Car body
          this.drawPixelRect(ctx, obs.x, obs.y + 8, 48, 16, '#E74C3C');
          // Car roof
          this.drawPixelRect(ctx, obs.x + 8, obs.y, 32, 12, '#C0392B');
          // Windows
          this.drawPixelRect(ctx, obs.x + 12, obs.y + 2, 10, 6, '#87CEEB');
          this.drawPixelRect(ctx, obs.x + 26, obs.y + 2, 10, 6, '#87CEEB');
          // Wheels
          this.drawPixelRect(ctx, obs.x + 8, obs.y + 24, 8, 4, '#2C3E50');
          this.drawPixelRect(ctx, obs.x + 32, obs.y + 24, 8, 4, '#2C3E50');
        } else {
          // Lake/ice hole
          this.drawPixelRect(ctx, obs.x, obs.y, obs.width, obs.height, '#4A90E2');
          this.drawPixelRect(ctx, obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8, '#2980B9');
          // Ice edge highlights
          this.drawPixelRect(ctx, obs.x, obs.y, obs.width, 4, '#E8F4F8');
        }
      });
    },
    
    checkCollision() {
      const p = this.game.player;
      return this.game.obstacles.some(obs => {
        // More precise hitbox
        const playerLeft = p.x + 10;
        const playerRight = p.x + 22;
        const playerTop = p.y + 4;
        const playerBottom = p.y + 30;
        
        return playerLeft < obs.x + obs.width &&
               playerRight > obs.x &&
               playerTop < obs.y + obs.height &&
               playerBottom > obs.y;
      });
    },
    
    gameLoop() {
      if (this.gameOver) return;
      
      const canvas = this.$refs.gameCanvas;
      const ctx = canvas.getContext('2d');
      
      this.game.frameCount++;
      this.game.score += 0.1;
      this.score = Math.floor(this.game.score);
      
      // Increase speed gradually
      this.game.speed = 3 + this.game.score / 200;
      
      // Update background - moving left as character runs right
      this.game.background.offset -= this.game.speed;
      
      // Update player
      if (this.game.player.jumping) {
        this.game.player.velocityY += this.game.gravity;
        this.game.player.y += this.game.player.velocityY;
        
        if (this.game.player.y >= this.game.groundY - this.game.player.size) {
          this.game.player.y = this.game.groundY - this.game.player.size;
          this.game.player.velocityY = 0;
          this.game.player.jumping = false;
        }
      }
      
      // Spawn obstacles - increased frequency
      const spawnRate = Math.max(30, 70 - Math.floor(this.game.score / 8));
      if (this.game.frameCount % spawnRate === 0) {
        const type = Math.random() > 0.5 ? 'car' : 'lake';
        const height = type === 'car' ? 28 : 16;
        const width = type === 'car' ? 48 : 40;
        this.game.obstacles.push({
          x: canvas.width,
          y: this.game.groundY - height,
          width: width,
          height: height,
          type
        });
      }
      
      // Update obstacles
      this.game.obstacles = this.game.obstacles.filter(obs => {
        obs.x -= this.game.speed;
        return obs.x > -50;
      });
      
      // Draw everything
      this.drawBackground(ctx);
      this.drawObstacles(ctx);
      this.drawPlayer(ctx);
      
      // Check collision
      if (this.checkCollision()) {
        this.gameOver = true;
        const finalScore = Math.floor(this.game.score);
        if (finalScore > this.highScore) {
          this.highScore = finalScore;
          localStorage.setItem('winterRunnerHighScore', finalScore.toString());
        }
        return;
      }
      
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  }
}
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #000;
  font-family: monospace;
}

canvas {
  display: block;
  touch-action: none;
}

.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  z-index: 10;
}

.menu {
  background-color: rgba(0, 0, 0, 0.8);
  padding: 30px;
  border-radius: 10px;
}

.menu h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

.menu p {
  margin-bottom: 20px;
}

.score {
  font-size: 24px;
  margin-bottom: 10px;
}

.high-score {
  margin-top: 20px;
  font-size: 18px;
}

.high-score-gold {
  font-size: 20px;
  margin-bottom: 20px;
  color: #FFD700;
}

.btn-start {
  font-size: 24px;
  padding: 15px 40px;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: monospace;
}

.btn-start:hover {
  background-color: #357ABD;
}

.btn-start:active {
  transform: scale(0.95);
}

.score-display {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  z-index: 5;
}
</style>