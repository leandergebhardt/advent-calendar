<template>
  <div class="game-container">
    <div class="game-content">
      <div class="highscore">High Score: {{ highscore }}</div>
      <div class="score">Score: {{ score }}</div>
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @mousemove="handleMouseMove"
        @touchmove="handleTouchMove"
        @touchstart="handleTouchStart"
      ></canvas>
      <div v-if="gameOver" class="game-over">Game Over!</div>
      <button v-if="gameOver" @click="resetGame" class="restart-btn">
        Restart
      </button>
      <div class="controls">
        {{
          isMobile
            ? "Touch to move paddle"
            : "Move paddle with Arrow Keys or Mouse"
        }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PongGame",
  data() {
    return {
      score: 0,
      highscore: 0,
      gameOver: false,
      canvasWidth: 600,
      canvasHeight: 400,
      paddle: {
        x: 260,
        y: 380,
        width: 80,
        height: 10,
        speed: 8,
      },
      ball: {
        x: 300,
        y: 200,
        radius: 6,
        dx: 3,
        dy: -3,
      },
      keys: {},
      mouseX: 300,
      touchX: 300,
      gameRunning: true,
      animationId: null,
      ctx: null,
      isMobile: false,
      scale: 1,
    };
  },
  mounted() {
    this.checkMobile();
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);

    this.ctx = this.$refs.canvas.getContext("2d");
    this.setupEventListeners();
    this.gameLoop();
  },
  beforeUnmount() {
    this.cleanupEventListeners();
    window.removeEventListener("resize", this.resizeCanvas);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  },
  methods: {
    checkMobile() {
      this.isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768;
    },
    resizeCanvas() {
      this.checkMobile();
      const maxWidth = Math.min(600, window.innerWidth - 40);
      const maxHeight = Math.min(400, window.innerHeight - 300);

      if (this.isMobile) {
        this.canvasWidth = maxWidth;
        this.canvasHeight = Math.floor(maxWidth * 0.667); // Maintain 3:2 aspect ratio
      } else {
        this.canvasWidth = 600;
        this.canvasHeight = 400;
      }

      this.scale = this.canvasWidth / 600;

      // Adjust game objects to new scale
      this.paddle.x =
        this.canvasWidth / 2 - (this.paddle.width * this.scale) / 2;
      this.paddle.y = this.canvasHeight - 20 * this.scale;
      this.paddle.width = 80 * this.scale;
      this.paddle.height = 10 * this.scale;
      this.paddle.speed = 8 * this.scale;

      this.ball.x = this.canvasWidth / 2;
      this.ball.y = this.canvasHeight / 2;
      this.ball.radius = 6 * this.scale;
    },
    setupEventListeners() {
      if (!this.isMobile) {
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
      }
    },
    cleanupEventListeners() {
      document.removeEventListener("keydown", this.handleKeyDown);
      document.removeEventListener("keyup", this.handleKeyUp);
    },
    handleKeyDown(e) {
      this.keys[e.key] = true;
    },
    handleKeyUp(e) {
      this.keys[e.key] = false;
    },
    handleMouseMove(e) {
      if (this.isMobile) return;
      const rect = this.$refs.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
    },
    handleTouchStart(e) {
      e.preventDefault();
      this.handleTouchMove(e);
    },
    handleTouchMove(e) {
      e.preventDefault();
      const rect = this.$refs.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.touchX = touch.clientX - rect.left;
    },
    drawPaddle() {
      this.ctx.fillStyle = "#00d4ff";
      this.ctx.fillRect(
        this.paddle.x,
        this.paddle.y,
        this.paddle.width,
        this.paddle.height
      );
    },
    drawBall() {
      this.ctx.beginPath();
      this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = "#ff4757";
      this.ctx.fill();
      this.ctx.closePath();
    },
    updatePaddle() {
      if (this.isMobile) {
        // Touch control
        if (
          this.touchX >= this.paddle.width / 2 &&
          this.touchX <= this.canvasWidth - this.paddle.width / 2
        ) {
          this.paddle.x = this.touchX - this.paddle.width / 2;
        }
      } else {
        // Keyboard control
        if (this.keys["ArrowLeft"] && this.paddle.x > 0) {
          this.paddle.x -= this.paddle.speed;
        }
        if (
          this.keys["ArrowRight"] &&
          this.paddle.x < this.canvasWidth - this.paddle.width
        ) {
          this.paddle.x += this.paddle.speed;
        }

        // Mouse control
        if (
          this.mouseX >= this.paddle.width / 2 &&
          this.mouseX <= this.canvasWidth - this.paddle.width / 2
        ) {
          this.paddle.x = this.mouseX - this.paddle.width / 2;
        }
      }
    },
    updateBall() {
      this.ball.x += this.ball.dx;
      this.ball.y += this.ball.dy;

      // Wall collision
      if (
        this.ball.x + this.ball.radius > this.canvasWidth ||
        this.ball.x - this.ball.radius < 0
      ) {
        this.ball.dx = -this.ball.dx;
      }

      // Top wall collision
      if (this.ball.y - this.ball.radius < 0) {
        this.ball.dy = -this.ball.dy;
        this.score++;

        // Increase difficulty
        if (this.score % 5 === 0) {
          this.ball.dx *= 1.05;
          this.ball.dy *= 1.05;
        }
      }

      // Paddle collision
      if (
        this.ball.y + this.ball.radius > this.paddle.y &&
        this.ball.x > this.paddle.x &&
        this.ball.x < this.paddle.x + this.paddle.width &&
        this.ball.dy > 0
      ) {
        const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
        this.ball.dx = (hitPos - 0.5) * 8 * this.scale;
        this.ball.dy = -this.ball.dy;
      }

      // Bottom - game over
      if (this.ball.y + this.ball.radius > this.canvasHeight) {
        this.gameRunning = false;
        this.gameOver = true;

        if (this.score > this.highscore) {
          this.highscore = this.score;
        }
      }
    },
    draw() {
      // Clear canvas
      this.ctx.fillStyle = "#0a0a1a";
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Draw center line
      this.ctx.strokeStyle = "#0f3460";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvasWidth / 2, 0);
      this.ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      this.drawPaddle();
      this.drawBall();
    },
    gameLoop() {
      if (!this.gameRunning) return;

      this.updatePaddle();
      this.updateBall();
      this.draw();

      this.animationId = requestAnimationFrame(this.gameLoop);
    },
    resetGame() {
      this.ball.x = this.canvasWidth / 2;
      this.ball.y = this.canvasHeight / 2;
      this.ball.dx = 3 * this.scale * (Math.random() > 0.5 ? 1 : -1);
      this.ball.dy = -3 * this.scale;
      this.paddle.x = this.canvasWidth / 2 - this.paddle.width / 2;
      this.score = 0;
      this.gameRunning = true;
      this.gameOver = false;
      this.gameLoop();
    },
  },
};
</script>

<style scoped>
.game-container {
  margin: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  font-family: "Courier New", monospace;
  color: #eee;
}

.game-content {
  text-align: center;
  width: 100%;
  max-width: 640px;
}

canvas {
  border: 3px solid #0f3460;
  background: #0a0a1a;
  box-shadow: 0 0 20px rgba(15, 52, 96, 0.5);
  touch-action: none;
  max-width: 100%;
  height: auto;
}

.score {
  font-size: 24px;
  margin: 20px 0;
  color: #00d4ff;
}

.highscore {
  font-size: 18px;
  color: #ffd700;
  margin-bottom: 10px;
}

.controls {
  margin-top: 20px;
  font-size: 14px;
  color: #aaa;
}

.game-over {
  font-size: 28px;
  color: #ff4757;
  margin: 15px 0;
}

.restart-btn {
  padding: 10px 30px;
  font-size: 16px;
  background: #0f3460;
  color: #00d4ff;
  border: 2px solid #00d4ff;
  cursor: pointer;
  font-family: "Courier New", monospace;
  margin-top: 10px;
  transition: all 0.3s;
}

.restart-btn:hover {
  background: #00d4ff;
  color: #0a0a1a;
}

@media (max-width: 768px) {
  .game-container {
    padding: 10px;
  }

  .score {
    font-size: 20px;
    margin: 15px 0;
  }

  .highscore {
    font-size: 16px;
  }

  .game-over {
    font-size: 24px;
  }

  .controls {
    font-size: 12px;
  }

  .restart-btn {
    padding: 12px 24px;
    font-size: 18px;
  }
}
</style>
