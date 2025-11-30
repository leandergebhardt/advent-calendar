<template>
  <div class="tetris-container">
    <div class="game-wrapper">
      <div class="header">
        <h1 class="title">TETRIS</h1>
        <div class="scores">
          <div class="score-item">
            <span class="label">Score:</span>
            <span class="value score">{{ score }}</span>
          </div>
          <div class="score-item">
            <span class="label">High:</span>
            <span class="value high-score">{{ highScore }}</span>
          </div>
        </div>
      </div>

      <div class="game-area">
        <div class="board" :style="boardStyle">
          <div v-for="(row, y) in displayBoard" :key="y" class="board-row">
            <div
              v-for="(cell, x) in row"
              :key="`${y}-${x}`"
              class="cell"
              :style="getCellStyle(cell)"
            />
          </div>
        </div>

        <div v-if="!gameStarted" class="overlay">
          <button @click="startGame" class="btn btn-start">START GAME</button>
        </div>

        <div v-if="gameOver" class="overlay">
          <div class="game-over-text">GAME OVER!</div>
          <div class="final-score">Score: {{ score }}</div>
          <button @click="startGame" class="btn btn-restart">PLAY AGAIN</button>
        </div>

        <div v-if="isPaused && gameStarted && !gameOver" class="overlay">
          <div class="paused-text">PAUSED</div>
          <button @click="togglePause" class="btn btn-resume">RESUME</button>
        </div>
      </div>

      <div v-if="gameStarted && !gameOver" class="controls">
        <div class="control-row">
          <button @click="movePiece(-1, 0)" class="btn-control btn-move">
            <span class="control-icon">←</span>
          </button>
          <button @click="rotatePiece" class="btn-control btn-rotate">
            <span class="control-icon">↻</span>
          </button>
          <button @click="movePiece(1, 0)" class="btn-control btn-move">
            <span class="control-icon">→</span>
          </button>
        </div>
        <div class="control-row">
          <button @click="togglePause" class="btn-control btn-pause">
            <span class="control-icon-small">{{ isPaused ? "▶" : "⏸" }}</span>
          </button>
          <button @click="dropPiece" class="btn-control btn-drop">
            <span class="control-icon">↓</span>
          </button>
          <button @click="movePiece(0, 1)" class="btn-control btn-soft">
            <span class="control-icon-small">Soft</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};

const COLORS = {
  I: "#00f0f0",
  O: "#f0f000",
  T: "#a000f0",
  S: "#00f000",
  Z: "#f00000",
  J: "#0000f0",
  L: "#f0a000",
};

export default {
  name: "TetrisGame",
  setup() {
    const board = ref(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(0))
    );
    const currentPiece = ref(null);
    const position = ref({ x: 0, y: 0 });
    const score = ref(0);
    const highScore = ref(0);
    const gameOver = ref(false);
    const gameStarted = ref(false);
    const isPaused = ref(false);
    const blockSize = ref(20);
    let gameInterval = null;

    const boardStyle = computed(() => ({
      width: `${BOARD_WIDTH * blockSize.value}px`,
      height: `${BOARD_HEIGHT * blockSize.value}px`,
      display: "grid",
      gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${blockSize.value}px)`,
    }));

    const calculateBlockSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Reserve space for header and controls with extra margin
      const headerHeight = 70;
      const controlsHeight = 160;
      const padding = 40;

      const availableHeight = vh - headerHeight - controlsHeight - padding;
      const availableWidth = vw - padding;

      const sizeByWidth = Math.floor(availableWidth / BOARD_WIDTH);
      const sizeByHeight = Math.floor(availableHeight / BOARD_HEIGHT);

      blockSize.value = Math.min(sizeByWidth, sizeByHeight, 35);
    };

    const loadHighScore = () => {
      const saved = localStorage.getItem("tetris-high-score");
      if (saved) {
        highScore.value = parseInt(saved);
      }
    };

    const saveHighScore = (newScore) => {
      localStorage.setItem("tetris-high-score", newScore.toString());
    };

    const createPiece = () => {
      const shapes = Object.keys(SHAPES);
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        shape: SHAPES[randomShape],
        color: COLORS[randomShape],
        type: randomShape,
      };
    };

    const checkCollision = (piece, pos, boardState) => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const newX = pos.x + x;
            const newY = pos.y + y;

            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return true;
            }

            if (newY >= 0 && boardState[newY][newX]) {
              return true;
            }
          }
        }
      }
      return false;
    };

    const mergePiece = () => {
      const newBoard = board.value.map((row) => [...row]);

      for (let y = 0; y < currentPiece.value.shape.length; y++) {
        for (let x = 0; x < currentPiece.value.shape[y].length; x++) {
          if (currentPiece.value.shape[y][x]) {
            const boardY = position.value.y + y;
            const boardX = position.value.x + x;
            if (boardY >= 0) {
              newBoard[boardY][boardX] = currentPiece.value.color;
            }
          }
        }
      }

      return newBoard;
    };

    const clearLines = (boardState) => {
      let linesCleared = 0;
      const newBoard = boardState.filter((row) => {
        if (row.every((cell) => cell !== 0)) {
          linesCleared++;
          return false;
        }
        return true;
      });

      while (newBoard.length < BOARD_HEIGHT) {
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
      }

      return { newBoard, linesCleared };
    };

    const movePiece = (dx, dy) => {
      if (!currentPiece.value || gameOver.value || isPaused.value) return;

      const newPos = { x: position.value.x + dx, y: position.value.y + dy };

      if (!checkCollision(currentPiece.value, newPos, board.value)) {
        position.value = newPos;
      } else if (dy > 0) {
        const mergedBoard = mergePiece();
        const { newBoard, linesCleared } = clearLines(mergedBoard);

        board.value = newBoard;
        score.value += linesCleared * 100;

        const newPiece = createPiece();
        const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };

        if (checkCollision(newPiece, startPos, newBoard)) {
          gameOver.value = true;
          if (score.value > highScore.value) {
            highScore.value = score.value;
            saveHighScore(score.value);
          }
          stopGame();
        } else {
          currentPiece.value = newPiece;
          position.value = startPos;
        }
      }
    };

    const rotatePiece = () => {
      if (!currentPiece.value || gameOver.value || isPaused.value) return;

      const rotated = currentPiece.value.shape[0].map((_, i) =>
        currentPiece.value.shape.map((row) => row[i]).reverse()
      );

      const rotatedPiece = { ...currentPiece.value, shape: rotated };

      if (!checkCollision(rotatedPiece, position.value, board.value)) {
        currentPiece.value = rotatedPiece;
      }
    };

    const dropPiece = () => {
      if (!currentPiece.value || gameOver.value || isPaused.value) return;

      let newY = position.value.y;
      while (
        !checkCollision(
          currentPiece.value,
          { x: position.value.x, y: newY + 1 },
          board.value
        )
      ) {
        newY++;
      }

      position.value = { x: position.value.x, y: newY };
      setTimeout(() => movePiece(0, 1), 50);
    };

    const startGame = () => {
      board.value = Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(0));
      currentPiece.value = createPiece();
      position.value = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
      score.value = 0;
      gameOver.value = false;
      gameStarted.value = true;
      isPaused.value = false;
      startGameLoop();
    };

    const togglePause = () => {
      if (gameStarted.value && !gameOver.value) {
        isPaused.value = !isPaused.value;
      }
    };

    const startGameLoop = () => {
      stopGame();
      gameInterval = setInterval(() => {
        if (!isPaused.value) {
          movePiece(0, 1);
        }
      }, 500);
    };

    const stopGame = () => {
      if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
      }
    };

    const handleKeyPress = (e) => {
      if (!gameStarted.value) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          movePiece(1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          movePiece(0, 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          rotatePiece();
          break;
        case " ":
          e.preventDefault();
          togglePause();
          break;
      }
    };

    const displayBoard = computed(() => {
      const display = board.value.map((row) => [...row]);

      if (currentPiece.value && !gameOver.value) {
        for (let y = 0; y < currentPiece.value.shape.length; y++) {
          for (let x = 0; x < currentPiece.value.shape[y].length; x++) {
            if (currentPiece.value.shape[y][x]) {
              const boardY = position.value.y + y;
              const boardX = position.value.x + x;
              if (
                boardY >= 0 &&
                boardY < BOARD_HEIGHT &&
                boardX >= 0 &&
                boardX < BOARD_WIDTH
              ) {
                display[boardY][boardX] = currentPiece.value.color;
              }
            }
          }
        }
      }

      return display;
    });

    const getCellStyle = (cell) => ({
      width: `${blockSize.value - 1}px`,
      height: `${blockSize.value - 1}px`,
      backgroundColor: cell || "#1a1a1a",
      border: cell ? "1px solid rgba(255,255,255,0.1)" : "none",
    });

    onMounted(() => {
      loadHighScore();
      calculateBlockSize();
      window.addEventListener("resize", calculateBlockSize);
      window.addEventListener("keydown", handleKeyPress);

      // Prevent pull-to-refresh and other default touch behaviors
      document.body.style.overscrollBehavior = "none";
      document.body.style.touchAction = "none";
    });

    onUnmounted(() => {
      stopGame();
      window.removeEventListener("resize", calculateBlockSize);
      window.removeEventListener("keydown", handleKeyPress);
      document.body.style.overscrollBehavior = "";
      document.body.style.touchAction = "";
    });

    return {
      board,
      displayBoard,
      score,
      highScore,
      gameOver,
      gameStarted,
      isPaused,
      boardStyle,
      getCellStyle,
      startGame,
      movePiece,
      rotatePiece,
      dropPiece,
      togglePause,
    };
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.tetris-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(to bottom right, #581c87, #1e3a8a);
  display: flex;
  flex-direction: column;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.game-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 15px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  min-height: 50px;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.scores {
  display: flex;
  gap: 15px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value {
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1;
}

.score {
  color: #fbbf24;
}

.high-score {
  color: #34d399;
}

.game-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 0;
}

.board {
  border: 3px solid #374151;
  background-color: #111;
  gap: 1px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
}

.board-row {
  display: flex;
  gap: 1px;
}

.cell {
  box-sizing: border-box;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 10;
}

.game-over-text,
.paused-text {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
}

.final-score {
  color: #fbbf24;
  font-size: 1.5rem;
  font-weight: bold;
}

.btn {
  font-weight: bold;
  padding: 15px 40px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-start,
.btn-restart,
.btn-resume {
  background: linear-gradient(to bottom, #059669, #047857);
  color: white;
}

.btn-start:active,
.btn-restart:active,
.btn-resume:active {
  transform: scale(0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 10px 10px;
}

.control-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.btn-control {
  font-weight: bold;
  padding: 0;
  height: 60px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  color: white;
  transition: all 0.1s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}

.btn-control:active {
  transform: scale(0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.control-icon {
  font-size: 2rem;
  line-height: 1;
}

.control-icon-small {
  font-size: 1.2rem;
  line-height: 1;
}

.btn-move {
  background: linear-gradient(to bottom, #2563eb, #1d4ed8);
}

.btn-rotate {
  background: linear-gradient(to bottom, #9333ea, #7e22ce);
}

.btn-pause {
  background: linear-gradient(to bottom, #ca8a04, #a16207);
}

.btn-drop {
  background: linear-gradient(to bottom, #dc2626, #b91c1c);
}

.btn-soft {
  background: linear-gradient(to bottom, #2563eb, #1d4ed8);
}

/* Landscape mode adjustments */
@media (orientation: landscape) {
  .game-wrapper {
    flex-direction: row;
    align-items: center;
  }

  .header {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    min-height: auto;
    min-width: 50px;
  }

  .title {
    font-size: 1.2rem;
  }

  .scores {
    flex-direction: column;
    gap: 20px;
  }

  .controls {
    min-width: 200px;
    flex-shrink: 0;
  }
}

/* Large screens */
@media (min-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .value {
    font-size: 1.5rem;
  }
}
</style>
