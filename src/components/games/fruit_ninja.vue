<template>
  <div 
    class="game-container"
    @touchmove.prevent="handleTouch"
    @touchstart.prevent="handleTouch"
  >
    <!-- Score Display -->
    <div class="score">Score: {{ score }}</div>
    <div class="high-score">High: {{ highScore }}</div>

    <!-- Lives Display -->
    <div class="lives">
      <span v-for="i in 3" :key="i" :class="{ active: i <= lives }">❤️</span>
    </div>

    <!-- Fruits -->
    <div
      v-for="fruit in fruits"
      :key="fruit.id"
      class="fruit"
      :style="{
        left: fruit.x - 30 + 'px',
        top: fruit.y - 30 + 'px',
        transform: `rotate(${fruit.rotation}deg)`,
        opacity: fruit.sliced ? 0 : 1
      }"
    >
      {{ fruit.emoji }}
    </div>

    <!-- Slash Trail -->
    <div
      v-for="(slash, i) in slashes"
      :key="i"
      class="slash"
      :style="{
        left: slash.x - 6 + 'px',
        top: slash.y - 6 + 'px',
        opacity: 1 - (Date.now() - slash.time) / 300
      }"
    />

    <!-- Start Screen -->
    <div v-if="!gameStarted && !gameOver" class="overlay">
      <div class="menu">
        <h1 class="title">🍉 Fruit Ninja</h1>
        <p class="subtitle">Slice fruits, avoid bombs!</p>
        <button @click="startGame" @touchend.prevent="startGame" class="btn">Start Game</button>
      </div>
    </div>

    <!-- Game Over Screen -->
    <div v-if="gameOver" class="overlay">
      <div class="menu">
        <h1 class="title">Game Over!</h1>
        <p class="score-text">Score: {{ score }}</p>
        <p class="high-score-text">High Score: {{ highScore }}</p>
        <button @click="startGame" @touchend.prevent="startGame" class="btn">Play Again</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FruitNinja',
  data() {
    return {
      score: 0,
      highScore: 0,
      fruits: [],
      slashes: [],
      gameStarted: false,
      gameOver: false,
      lives: 3,
      nextId: 0,
      spawnInterval: null,
      gameLoop: null,
      fruitTypes: [
        { emoji: '🍎', color: '#ff4444', points: 10 },
        { emoji: '🍊', color: '#ff8c00', points: 10 },
        { emoji: '🍋', color: '#ffd700', points: 10 },
        { emoji: '🍉', color: '#ff6b9d', points: 15 },
        { emoji: '🍇', color: '#9b59b6', points: 15 },
        { emoji: '🍌', color: '#ffe135', points: 10 },
        { emoji: '💣', color: '#333', points: -50 }
      ]
    };
  },
  methods: {
    spawnFruit(x, vx, vy, isBomb = null) {
      if (isBomb === null) {
        isBomb = Math.random() < 0.15;
      }
      const fruitType = isBomb 
        ? this.fruitTypes[this.fruitTypes.length - 1]
        : this.fruitTypes[Math.floor(Math.random() * (this.fruitTypes.length - 1))];

      this.fruits.push({
        id: this.nextId++,
        ...fruitType,
        x: x,
        y: window.innerHeight + 50,
        vx: vx,
        vy: vy,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        sliced: false,
        isBomb
      });
    },

    spawnPattern() {
      const patterns = [
        // Horizontal line from left
        () => {
          const baseY = -(18 + Math.random() * 5);
          const hasBomb = Math.random() < 0.3;
          for (let i = 0; i < 5; i++) {
            const isBomb = hasBomb && i === Math.floor(Math.random() * 5);
            this.spawnFruit(
              50 + i * 80,
              (Math.random() - 0.3) * 4,
              baseY + (Math.random() - 0.5) * 2,
              isBomb
            );
          }
        },
        // Horizontal line from right
        () => {
          const baseY = -(18 + Math.random() * 5);
          const hasBomb = Math.random() < 0.3;
          for (let i = 0; i < 5; i++) {
            const isBomb = hasBomb && i === Math.floor(Math.random() * 5);
            this.spawnFruit(
              window.innerWidth - 50 - i * 80,
              -(Math.random() - 0.3) * 4,
              baseY + (Math.random() - 0.5) * 2,
              isBomb
            );
          }
        },
        // V shape
        () => {
          const centerX = window.innerWidth / 2;
          const hasBomb = Math.random() < 0.25;
          for (let i = 0; i < 6; i++) {
            const isBomb = hasBomb && i === 3;
            const offset = (i - 2.5) * 60;
            this.spawnFruit(
              centerX + offset,
              offset * 0.15,
              -(16 + Math.abs(offset) * 0.05),
              isBomb
            );
          }
        },
        // Diagonal spray
        () => {
          const fromLeft = Math.random() < 0.5;
          const startX = fromLeft ? 100 : window.innerWidth - 100;
          const hasBomb = Math.random() < 0.3;
          for (let i = 0; i < 6; i++) {
            const isBomb = hasBomb && i === Math.floor(Math.random() * 6);
            this.spawnFruit(
              startX + (fromLeft ? i * 70 : -i * 70),
              (fromLeft ? 1 : -1) * (3 + i * 0.5),
              -(15 + i * 1.5 + Math.random() * 2),
              isBomb
            );
          }
        },
        // Circle burst
        () => {
          const centerX = window.innerWidth / 2;
          const hasBomb = Math.random() < 0.3;
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const isBomb = hasBomb && i === Math.floor(Math.random() * 8);
            this.spawnFruit(
              centerX + Math.cos(angle) * 50,
              Math.cos(angle) * 6,
              -(18 + Math.sin(angle) * 4),
              isBomb
            );
          }
        },
        // Wave pattern
        () => {
          const hasBomb = Math.random() < 0.25;
          for (let i = 0; i < 7; i++) {
            const isBomb = hasBomb && i === Math.floor(Math.random() * 7);
            const x = (window.innerWidth / 8) * (i + 1);
            const waveOffset = Math.sin(i * 0.8) * 3;
            this.spawnFruit(
              x,
              (Math.random() - 0.5) * 3,
              -(17 + waveOffset),
              isBomb
            );
          }
        },
        // Double arc
        () => {
          const hasBomb = Math.random() < 0.3;
          for (let i = 0; i < 8; i++) {
            const isBomb = hasBomb && (i === 2 || i === 5);
            const side = i < 4 ? 0 : 1;
            const localI = i % 4;
            const x = side === 0 ? 100 + localI * 100 : window.innerWidth - 100 - localI * 100;
            this.spawnFruit(
              x,
              (side === 0 ? 1 : -1) * (2 + localI * 0.5),
              -(16 + localI * 2),
              isBomb
            );
          }
        },
        // Fountain
        () => {
          const centerX = window.innerWidth / 2;
          const hasBomb = Math.random() < 0.25;
          for (let i = 0; i < 9; i++) {
            const isBomb = hasBomb && i === 4;
            const offset = (i - 4) * 45;
            this.spawnFruit(
              centerX + offset,
              offset * 0.12,
              -(20 - Math.abs(offset) * 0.08),
              isBomb
            );
          }
        }
      ];

      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      pattern();
    },

    updateGame() {
      this.fruits = this.fruits.map(fruit => ({
        ...fruit,
        x: fruit.x + fruit.vx,
        y: fruit.y + fruit.vy,
        vy: fruit.vy + 0.6,
        rotation: fruit.rotation + fruit.rotationSpeed
      })).filter(fruit => {
        return fruit.y < window.innerHeight + 100;
      });

      this.slashes = this.slashes.filter(slash => Date.now() - slash.time < 300);
    },

    checkCollision(fruit, x, y) {
      const dx = fruit.x - x;
      const dy = fruit.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 40;
    },

    handleTouch(e) {
      if (!this.gameStarted || this.gameOver) return;

      const touch = e.touches[0] || e.changedTouches[0];
      const x = touch.clientX;
      const y = touch.clientY;

      this.slashes.push({ x, y, time: Date.now() });

      this.fruits.forEach(fruit => {
        if (fruit.sliced) return;
        if (this.checkCollision(fruit, x, y)) {
          if (fruit.isBomb) {
            this.endGame();
          } else {
            this.score += fruit.points;
          }
          fruit.sliced = true;
        }
      });
    },

    startGame() {
      this.score = 0;
      this.lives = 3;
      this.fruits = [];
      this.slashes = [];
      this.gameStarted = true;
      this.gameOver = false;
      this.nextId = 0;

      this.spawnInterval = setInterval(() => {
        this.spawnPattern();
      }, 1400);

      this.gameLoop = setInterval(() => {
        this.updateGame();
      }, 1000 / 60);
    },

    endGame() {
      this.gameOver = true;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      clearInterval(this.spawnInterval);
      clearInterval(this.gameLoop);
    }
  },

  beforeUnmount() {
    if (this.spawnInterval) clearInterval(this.spawnInterval);
    if (this.gameLoop) clearInterval(this.gameLoop);
  }
};
</script>

<style scoped>
.game-container {
  position: fixed;
  inset: 0;
  background: linear-gradient(to bottom, #38bdf8, #7dd3fc);
  overflow: hidden;
  user-select: none;
  touch-action: none;
}

.score {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.high-score {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.lives {
  position: absolute;
  top: 4rem;
  left: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.lives span {
  font-size: 1.5rem;
  opacity: 0.3;
  transition: opacity 0.3s;
}

.lives span.active {
  opacity: 1;
}

.fruit {
  position: absolute;
  font-size: 3rem;
  transition: opacity 0.3s;
  pointer-events: none;
}

.slash {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 20;
}

.menu {
  text-align: center;
}

.title {
  font-size: 3.75rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
}

.subtitle {
  color: white;
  font-size: 1.25rem;
  margin-bottom: 2rem;
}

.score-text {
  color: white;
  font-size: 1.875rem;
  margin-bottom: 0.5rem;
}

.high-score-text {
  color: #fde047;
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.btn {
  background: white;
  color: #0284c7;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-size: 1.5rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
  touch-action: auto;
}

.btn:hover {
  transform: scale(1.05);
}

.btn:active {
  transform: scale(0.95);
}
</style>