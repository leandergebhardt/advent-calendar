<template>
  <div class="game-container">
    <div class="game-content">
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
      <button @click="togglePause" class="pause-btn-mobile">
        {{ isPaused ? '▶ Resume' : '⏸ Pause' }}
      </button>
    </div>

    <div class="instructions">
      <strong>Desktop:</strong> Arrow keys or WASD • Space to pause<br>
      <strong>Mobile:</strong> Swipe to control direction
    </div>
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
      nextDirection: { x: 1, y: 0 },
      food: { x: 15, y: 15 },
      gameOver: false,
      score: 0,
      isPaused: false,
      trail: [],
      gameInterval: null,
      trailInterval: null,
      touchStartX: 0,
      touchStartY: 0,
      touchEndX: 0,
      touchEndY: 0,
      minSwipeDistance: 30
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
    document.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  },
  beforeUnmount() {
    this.stopGame();
    window.removeEventListener('keydown', this.handleKeyPress);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchend', this.handleTouchEnd);
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

      // Update direction from queued input
      this.direction = this.nextDirection;

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
      // Queue the direction change for next game tick
      this.nextDirection = newDir;
    },
    togglePause() {
      if (!this.gameOver) {
        this.isPaused = !this.isPaused;
      }
    },
    resetGame() {
      this.snake = [{ x: 10, y: 10 }];
      this.direction = { x: 1, y: 0 };
      this.nextDirection = { x: 1, y: 0 };
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
    handleTouchStart(e) {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    },
    handleTouchEnd(e) {
      if (this.gameOver) return;
      
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      this.handleSwipe();
    },
    handleSwipe() {
      const deltaX = this.touchEndX - this.touchStartX;
      const deltaY = this.touchEndY - this.touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Check if swipe is long enough
      if (absDeltaX < this.minSwipeDistance && absDeltaY < this.minSwipeDistance) {
        return;
      }

      // Determine swipe direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          this.changeDirection({ x: 1, y: 0 }); // Right
        } else {
          this.changeDirection({ x: -1, y: 0 }); // Left
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          this.changeDirection({ x: 0, y: 1 }); // Down
        } else {
          this.changeDirection({ x: 0, y: -1 }); // Up
        }
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.game-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #0f172a, #581c87, #0f172a);
  overflow: hidden;
  touch-action: none;
}

.game-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  max-width: 100%;
  max-height: 100%;
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

.pause-btn-mobile {
  padding: 0.75rem 2rem;
  background: rgba(6, 182, 212, 0.8);
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.125rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: background 0.1s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.pause-btn-mobile:hover {
  background: rgba(6, 182, 212, 1);
}

.pause-btn-mobile:active {
  background: rgba(8, 145, 178, 1);
  transform: scale(0.95);
}

.instructions {
  margin-top: 1rem;
  text-align: center;
  color: #c084fc;
  font-size: 0.875rem;
}
</style>