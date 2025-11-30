<template>
  <div class="game-container">
    <canvas
      ref="canvas"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    />

    <div class="score-display">
      <div class="score">Score: {{ score }}</div>
      <div class="high-score">High: {{ highScore }}</div>
    </div>

    <div v-if="!gameStarted" class="menu-overlay">
      <div class="menu-content">
        <h1 class="title">SPACE INVADERS</h1>
        <div v-if="gameOver">
          <div class="game-over">GAME OVER</div>
          <div class="final-score">Final Score: {{ score }}</div>
        </div>
        <button @click="startGame" class="start-button">
          {{ gameOver ? 'PLAY AGAIN' : 'START GAME' }}
        </button>
        <div class="instructions">Touch/Click and hold to move and shoot</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpaceInvaders',
  data() {
    return {
      score: 0,
      highScore: 0,
      gameOver: false,
      gameStarted: false,
      gameState: {
        player: { x: 0, y: 0, width: 40, height: 30, speed: 5 },
        bullets: [],
        enemies: [],
        enemyBullets: [],
        touchX: null,
        shooting: false,
        lastShot: 0,
        enemyDirection: 1,
        enemyMoveDown: false,
      },
      animationId: null,
      lastUpdate: 0,
      enemyMoveCounter: 0,
    }
  },
  mounted() {
    this.loadHighScore()
    this.resizeCanvas()
    window.addEventListener('resize', this.resizeCanvas)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCanvas)
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  },
  methods: {
    loadHighScore() {
      const saved = localStorage.getItem('space-invaders-highscore')
      if (saved) {
        this.highScore = parseInt(saved)
      }
    },
    saveHighScore(newScore) {
      localStorage.setItem('space-invaders-highscore', newScore.toString())
      this.highScore = newScore
    },
    resizeCanvas() {
      const canvas = this.$refs.canvas
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        if (this.gameStarted && !this.gameOver) {
          this.gameState.player.y = canvas.height - 60
        }
      }
    },
    initGame() {
      const canvas = this.$refs.canvas
      if (!canvas) return

      const state = this.gameState
      state.player.x = canvas.width / 2 - state.player.width / 2
      state.player.y = canvas.height - 60
      state.bullets = []
      state.enemyBullets = []
      state.enemies = []
      state.enemyDirection = 1
      state.enemyMoveDown = false
      state.touchX = null
      state.shooting = false
      state.lastShot = 0

      // Create enemy grid
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
          state.enemies.push({
            x: col * 60 + 50,
            y: row * 50 + 50,
            width: 35,
            height: 35,
            alive: true,
          })
        }
      }

      this.score = 0
      this.gameOver = false
      this.gameStarted = true
      this.lastUpdate = 0
      this.enemyMoveCounter = 0
      this.$nextTick(() => {
        this.gameLoop()
      })
    },
    drawPlayer(ctx) {
      const p = this.gameState.player
      ctx.fillStyle = '#4ade80'
      ctx.fillRect(p.x, p.y, p.width, p.height)
      ctx.fillRect(p.x + 15, p.y - 10, 10, 10)
    },
    drawBullets(ctx) {
      ctx.fillStyle = '#fbbf24'
      this.gameState.bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, 3, 10)
      })
    },
    drawEnemyBullets(ctx) {
      ctx.fillStyle = '#ef4444'
      this.gameState.enemyBullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, 3, 10)
      })
    },
    drawEnemies(ctx) {
      ctx.fillStyle = '#8b5cf6'
      this.gameState.enemies.forEach((enemy) => {
        if (enemy.alive) {
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
          ctx.fillRect(enemy.x + 5, enemy.y - 8, 8, 8)
          ctx.fillRect(enemy.x + 22, enemy.y - 8, 8, 8)
        }
      })
    },
    updateBullets() {
      this.gameState.bullets = this.gameState.bullets.filter((bullet) => {
        bullet.y -= 6
        return bullet.y > 0
      })
    },
    updateEnemyBullets() {
      const canvas = this.$refs.canvas
      this.gameState.enemyBullets = this.gameState.enemyBullets.filter((bullet) => {
        bullet.y += 3
        return bullet.y < canvas.height
      })
    },
    checkCollisions() {
      const state = this.gameState

      state.bullets.forEach((bullet, bIndex) => {
        state.enemies.forEach((enemy) => {
          if (
            enemy.alive &&
            bullet.x > enemy.x &&
            bullet.x < enemy.x + enemy.width &&
            bullet.y > enemy.y &&
            bullet.y < enemy.y + enemy.height
          ) {
            enemy.alive = false
            state.bullets.splice(bIndex, 1)
            this.score += 10
          }
        })
      })

      state.enemyBullets.forEach((bullet) => {
        if (
          bullet.x > state.player.x &&
          bullet.x < state.player.x + state.player.width &&
          bullet.y > state.player.y &&
          bullet.y < state.player.y + state.player.height
        ) {
          this.gameOver = true
          this.gameStarted = false
          if (this.score > this.highScore) {
            this.saveHighScore(this.score)
          }
        }
      })
    },
    updateEnemies() {
      const canvas = this.$refs.canvas
      const state = this.gameState
      const aliveEnemies = state.enemies.filter((e) => e.alive)

      if (aliveEnemies.length === 0) {
        this.initGame()
        return
      }

      // Only move enemies every 15 frames
      this.enemyMoveCounter++
      if (this.enemyMoveCounter < 15) {
        // Still shoot even when not moving
        if (Math.random() < 0.015 && aliveEnemies.length > 0) {
          const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]
          state.enemyBullets.push({
            x: shooter.x + shooter.width / 2,
            y: shooter.y + shooter.height,
          })
        }
        return
      }
      this.enemyMoveCounter = 0

      const leftMost = Math.min(...aliveEnemies.map((e) => e.x))
      const rightMost = Math.max(...aliveEnemies.map((e) => e.x + e.width))

      if (state.enemyMoveDown) {
        state.enemies.forEach((enemy) => {
          if (enemy.alive) enemy.y += 15
        })
        state.enemyDirection *= -1
        state.enemyMoveDown = false
      } else {
        if (
          (rightMost >= canvas.width - 20 && state.enemyDirection > 0) ||
          (leftMost <= 20 && state.enemyDirection < 0)
        ) {
          state.enemyMoveDown = true
        }

        state.enemies.forEach((enemy) => {
          if (enemy.alive) enemy.x += state.enemyDirection * 1
        })
      }

      if (Math.random() < 0.015 && aliveEnemies.length > 0) {
        const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]
        state.enemyBullets.push({
          x: shooter.x + shooter.width / 2,
          y: shooter.y + shooter.height,
        })
      }

      const lowestEnemy = Math.max(...aliveEnemies.map((e) => e.y))
      if (lowestEnemy >= state.player.y - 30) {
        this.gameOver = true
        this.gameStarted = false
        if (this.score > this.highScore) {
          this.saveHighScore(this.score)
        }
      }
    },
    updatePlayer() {
      const canvas = this.$refs.canvas
      const state = this.gameState

      if (state.touchX !== null) {
        state.player.x = state.touchX - state.player.width / 2
      }
      state.player.x = Math.max(0, Math.min(canvas.width - state.player.width, state.player.x))

      if (state.shooting && Date.now() - state.lastShot > 400) {
        state.bullets.push({
          x: state.player.x + state.player.width / 2,
          y: state.player.y,
        })
        state.lastShot = Date.now()
      }
    },
    gameLoop() {
      if (!this.gameStarted || this.gameOver) return

      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      this.updatePlayer()
      this.updateBullets()
      this.updateEnemyBullets()
      this.updateEnemies()
      this.checkCollisions()

      this.drawPlayer(ctx)
      this.drawBullets(ctx)
      this.drawEnemyBullets(ctx)
      this.drawEnemies(ctx)

      this.animationId = requestAnimationFrame(this.gameLoop)
    },
    handleTouchStart(e) {
      e.preventDefault()
      const touch = e.touches[0]
      this.gameState.touchX = touch.clientX
      this.gameState.shooting = true
    },
    handleTouchMove(e) {
      e.preventDefault()
      const touch = e.touches[0]
      this.gameState.touchX = touch.clientX
    },
    handleTouchEnd(e) {
      e.preventDefault()
      this.gameState.shooting = false
    },
    handleMouseDown(e) {
      this.gameState.touchX = e.clientX
      this.gameState.shooting = true
    },
    handleMouseMove(e) {
      if (this.gameState.shooting) {
        this.gameState.touchX = e.clientX
      }
    },
    handleMouseUp() {
      this.gameState.shooting = false
    },
    enterFullscreen() {
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      }
    },
    startGame() {
      this.enterFullscreen()
      this.initGame()
    },
  },
}
</script>

<style scoped>
.game-container {
  position: fixed;
  inset: 0;
  background-color: #0f172a;
  overflow: hidden;
}

canvas {
  position: absolute;
  inset: 0;
  touch-action: none;
}

.score-display {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: white;
  font-family: monospace;
  z-index: 10;
}

.score {
  font-size: 2rem;
}

.high-score {
  font-size: 1.25rem;
  color: #9ca3af;
}

.menu-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(15, 23, 42, 0.9);
  z-index: 20;
}

.menu-content {
  text-align: center;
  color: white;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #4ade80;
}

.game-over {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ef4444;
}

.final-score {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.start-button {
  background-color: #22c55e;
  color: white;
  font-weight: bold;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-button:hover {
  background-color: #16a34a;
}

.instructions {
  margin-top: 1.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .title {
    font-size: 2rem;
  }

  .game-over {
    font-size: 1.5rem;
  }

  .final-score {
    font-size: 1.25rem;
  }
}
</style>
