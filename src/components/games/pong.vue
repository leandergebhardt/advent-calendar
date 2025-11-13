<template>
  <div class="game-container">
    <div class="game-content">
      <div class="highscore">High Score: {{ highscore }}</div>
      <div class="score">Score: {{ score }}</div>
      <canvas
        ref="canvas"
        width="600"
        height="400"
        @mousemove="handleMouseMove"
      ></canvas>
      <div v-if="gameOver" class="game-over">Game Over!</div>
      <button v-if="gameOver" @click="resetGame" class="restart-btn">
        Restart
      </button>
      <div class="controls">Move paddle with touchscreen</div>
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
      gameRunning: true,
      animationId: null,
      ctx: null,
    };
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d");
    this.setupEventListeners();
    this.gameLoop();
  },
  beforeUnmount() {
    this.cleanupEventListeners();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  },
  methods: {
    setupEventListeners() {
      document.addEventListener("keydown", this.handleKeyDown);
      document.addEventListener("keyup", this.handleKeyUp);
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
      const rect = this.$refs.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
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
      if (this.keys["ArrowLeft"] && this.paddle.x > 0) {
        this.paddle.x -= this.paddle.speed;
      }
      if (this.keys["ArrowRight"] && this.paddle.x < 600 - this.paddle.width) {
        this.paddle.x += this.paddle.speed;
      }

      if (
        this.mouseX >= this.paddle.width / 2 &&
        this.mouseX <= 600 - this.paddle.width / 2
      ) {
        this.paddle.x = this.mouseX - this.paddle.width / 2;
      }
    },
    updateBall() {
      this.ball.x += this.ball.dx;
      this.ball.y += this.ball.dy;

      // Wall collision
      if (
        this.ball.x + this.ball.radius > 600 ||
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
        this.ball.dx = (hitPos - 0.5) * 8;
        this.ball.dy = -this.ball.dy;
      }

      // Bottom - game over
      if (this.ball.y + this.ball.radius > 400) {
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
      this.ctx.fillRect(0, 0, 600, 400);

      // Draw center line
      this.ctx.strokeStyle = "#0f3460";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(300, 0);
      this.ctx.lineTo(300, 400);
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
      this.ball.x = 300;
      this.ball.y = 200;
      this.ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
      this.ball.dy = -3;
      this.paddle.x = 260;
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
}

canvas {
  border: 3px solid #0f3460;
  background: #0a0a1a;
  box-shadow: 0 0 20px rgba(15, 52, 96, 0.5);
  cursor: none;
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
</style>
