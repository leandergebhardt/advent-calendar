<template>
  <div class="game-container">
    <div class="header">
      <h1 class="title">Snake Game</h1>
      <div class="score">Score: {{ score }}</div>
    </div>

    <div class="game-board" :style="boardStyle">
      <!-- Trail effect -->
      <div
        v-for="(segment, i) in trail"
        :key="`trail-${i}-${segment.timestamp}`"
        class="trail-segment"
        :style="getTrailStyle(segment)"
      />

      <!-- Snake -->
      <div
        v-for="(segment, i) in snake"
        :key="`snake-${i}`"
        class="snake-segment"
        :class="{ head: i === 0 }"
        :style="getSegmentStyle(segment)"
      />

      <!-- Food -->
      <div class="food" :style="getFoodStyle()" />

      <!-- Game Over Overlay -->
      <div v-if="gameOver" class="overlay">
        <div class="overlay-content">
          <div class="game-over-text">Game Over!</div>
          <div class="final-score">Final Score: {{ score }}</div>
          <button @click="resetGame" class="play-again-btn">
            Play Again
          </button>
        </div>
      </div>

      <!-- Pause Overlay -->
      <div v-if="isPaused && !gameOver" class="overlay">
        <div class="paused-text">PAUSED</div>
      </div>
    </div>

    <!-- Mobile Controls -->
    <div class="controls">
      <div class="controls-grid">
        <div></div>
        <button @click="changeDirection({ x: 0, y: -1 })" class="control-btn">
          ↑
        </button>
        <div></div>
        <button @click="changeDirection({ x: -1, y: 0 })" class="control-btn">
          ←
        </button>
        <button @click="togglePause" class="control-btn pause-btn">
          {{ isPaused ? '▶' : '⏸' }}
        </button>
        <button @click="changeDirection({ x: 1, y: 0 })" class="control-btn">
          →
        </button>
        <div></div>
        <button @click="changeDirection({ x: 0, y: 1 })" class="control-btn">
          ↓
        </button>
        <div></div>
      </div>
    </div>

    <div class="instructions">
      Use arrow keys or WASD to play • Space to pause
    </div>
  </div>
</template>

<script>
export default {
  name: 'SnakeGame',
  data() {
    return {
      GRID_SIZE: 20,
      CELL_SIZE: 20,
      GAME_SPEED: 150,
      snake: [{ x: 10, y: 10 }],
      direction: { x: 1, y: 0 },
      food: { x: 15, y: 15 },
      gameOver: false,
      score: 0,
      isPaused: false,
      trail: [],
      gameInterval: null,
      trailInterval: null
    };
  },
  computed: {
    boardStyle() {
      return {
        width: `${this.GRID_SIZE * this.CELL_SIZE}px`,
        height: `${this.GRID_SIZE * this.CELL_SIZE}px`
      };
    }
  },
  mounted() {
    this.startGame();
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    this.stopGame();
    window.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    startGame() {
      this.gameInterval = setInterval(this.gameLoop, this.GAME_SPEED);
      this.trailInterval = setInterval(this.cleanupTrail, 50);
    },
    stopGame() {
      if (this.gameInterval) clearInterval(this.gameInterval);
      if (this.trailInterval) clearInterval(this.trailInterval);
    },
    gameLoop() {
      if (this.gameOver || this.isPaused) return;

      const head = this.snake[0];
      const newHead = {
        x: (head.x + this.direction.x + this.GRID_SIZE) % this.GRID_SIZE,
        y: (head.y + this.direction.y + this.GRID_SIZE) % this.GRID_SIZE
      };

      // Check collision with self
      if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        this.gameOver = true;
        return;
      }

      const newSnake = [newHead, ...this.snake];

      // Check if food eaten
      if (newHead.x === this.food.x && newHead.y === this.food.y) {
        this.food = this.generateFood();
        this.score += 10;
      } else {
        const tail = newSnake.pop();
        this.trail.push({ ...tail, timestamp: Date.now() });
      }

      this.snake = newSnake;
    },
    cleanupTrail() {
      this.trail = this.trail.filter(t => Date.now() - t.timestamp < 300);
    },
    generateFood() {
      return {
        x: Math.floor(Math.random() * this.GRID_SIZE),
        y: Math.floor(Math.random() * this.GRID_SIZE)
      };
    },
    changeDirection(newDir) {
      if (this.gameOver) return;
      // Prevent reversing
      if (newDir.x === -this.direction.x && newDir.y === -this.direction.y) return;
      this.direction = newDir;
    },
    togglePause() {
      if (!this.gameOver) {
        this.isPaused = !this.isPaused;
      }
    },
    resetGame() {
      this.snake = [{ x: 10, y: 10 }];
      this.direction = { x: 1, y: 0 };
      this.food = this.generateFood();
      this.gameOver = false;
      this.score = 0;
      this.isPaused = false;
      this.trail = [];
    },
    handleKeyPress(e) {
      if (this.gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          this.changeDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          this.changeDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          this.changeDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          this.changeDirection({ x: 1, y: 0 });
          break;
        case ' ':
          e.preventDefault();
          this.togglePause();
          break;
      }
    },
    getSegmentStyle(segment) {
      return {
        left: `${segment.x * this.CELL_SIZE}px`,
        top: `${segment.y * this.CELL_SIZE}px`,
        width: `${this.CELL_SIZE - 2}px`,
        height: `${this.CELL_SIZE - 2}px`
      };
    },
    getTrailStyle(segment) {
      const age = Date.now() - segment.timestamp;
      const opacity = Math.max(0, 1 - age / 300);
      return {
        left: `${segment.x * this.CELL_SIZE}px`,
        top: `${segment.y * this.CELL_SIZE}px`,
        width: `${this.CELL_SIZE - 2}px`,
        height: `${this.CELL_SIZE - 2}px`,
        backgroundColor: `rgba(139, 92, 246, ${opacity * 0.5})`,
        boxShadow: `0 0 ${10 * opacity}px rgba(139, 92, 246, ${opacity})`,
        opacity: opacity
      };
    },
    getFoodStyle() {
      return {
        left: `${this.food.x * this.CELL_SIZE}px`,
        top: `${this.food.y * this.CELL_SIZE}px`,
        width: `${this.CELL_SIZE - 2}px`,
        height: `${this.CELL_SIZE - 2}px`
      };
    }
  }
};
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #0f172a, #581c87, #0f172a);
  padding: 1rem;
}

.header {
  margin-bottom: 1rem;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(to right, #22d3ee, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #22d3ee;
}

.game-board {
  position: relative;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(168, 85, 247, 0.3);
}

.trail-segment {
  position: absolute;
  border-radius: 0.125rem;
  transition: opacity 100ms;
}

.snake-segment {
  position: absolute;
  background-color: #8b5cf6;
  border-radius: 0.125rem;
  box-shadow: 0 0 10px #8b5cf6;
}

.snake-segment.head {
  background-color: #06b6d4;
  box-shadow: 0 0 20px #06b6d4, 0 0 40px rgba(6, 182, 212, 0.5);
}

.food {
  position: absolute;
  background-color: #f43f5e;
  border-radius: 50%;
  box-shadow: 0 0 20px #f43f5e, 0 0 40px rgba(244, 63, 94, 0.5);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 0.5rem;
}

.overlay-content {
  text-align: center;
}

.game-over-text {
  font-size: 2.5rem;
  font-weight: bold;
  color: #f87171;
  margin-bottom: 1rem;
}

.final-score {
  font-size: 1.5rem;
  color: #22d3ee;
  margin-bottom: 1.5rem;
}

.play-again-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #06b6d4, #a78bfa);
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.play-again-btn:hover {
  background: linear-gradient(to right, #0891b2, #9333ea);
  transform: translateY(-2px);
}

.paused-text {
  font-size: 2.5rem;
  font-weight: bold;
  color: #22d3ee;
}

.controls {
  margin-top: 1.5rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  width: 12rem;
}

.control-btn {
  padding: 1rem;
  background: rgba(147, 51, 234, 0.8);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  user-select: none;
}

.control-btn:hover {
  background: rgba(147, 51, 234, 1);
}

.control-btn:active {
  background: rgba(107, 33, 168, 1);
  transform: scale(0.95);
}

.control-btn.pause-btn {
  background: rgba(6, 182, 212, 0.8);
}

.control-btn.pause-btn:hover {
  background: rgba(6, 182, 212, 1);
}

.control-btn.pause-btn:active {
  background: rgba(8, 145, 178, 1);
}

.instructions {
  margin-top: 1rem;
  text-align: center;
  color: #c084fc;
  font-size: 0.875rem;
}
</style>