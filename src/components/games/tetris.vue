<template>
  <div class="tetris-container">
    <div class="game-wrapper">
      <h1 class="title">TETRIS</h1>

      <div class="content">
        <div class="sidebar">
          <div class="score-box">
            <div class="label">Score</div>
            <div class="value score">{{ score }}</div>
          </div>

          <div class="score-box">
            <div class="label">High Score</div>
            <div class="value high-score">{{ highScore }}</div>
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

          <button v-if="!gameStarted" @click="startGame" class="btn btn-start">
            START GAME
          </button>

          <div v-if="gameOver" class="game-over">
            <div class="game-over-text">GAME OVER!</div>
            <button @click="startGame" class="btn btn-restart">
              PLAY AGAIN
            </button>
          </div>

          <div v-if="isPaused && gameStarted && !gameOver" class="paused">
            PAUSED
          </div>

          <div v-if="gameStarted && !gameOver" class="controls">
            <button @click="movePiece(-1, 0)" class="btn-control btn-move">
              ←
            </button>
            <button @click="rotatePiece" class="btn-control btn-rotate">
              ↻
            </button>
            <button @click="movePiece(1, 0)" class="btn-control btn-move">
              →
            </button>
            <button @click="togglePause" class="btn-control btn-pause">
              {{ isPaused ? "▶" : "⏸" }}
            </button>
            <button @click="dropPiece" class="btn-control btn-drop">↓</button>
            <button @click="movePiece(0, 1)" class="btn-control btn-soft">
              Soft ↓
            </button>
          </div>
        </div>
      </div>

      <div class="instructions">
        <div class="inst-title">Controls:</div>
        <div class="inst-grid">
          <div>Touch buttons or keyboard</div>
          <div>← → : Move</div>
          <div>↻ : Rotate</div>
          <div>↓ : Drop / Soft Drop</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

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
      const maxWidth = Math.min(window.innerWidth - 40, 400);
      const maxHeight = window.innerHeight - 300;
      const size = Math.min(
        Math.floor(maxWidth / BOARD_WIDTH),
        Math.floor(maxHeight / BOARD_HEIGHT)
      );
      blockSize.value = Math.max(15, Math.min(30, size));
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
    });

    onUnmounted(() => {
      stopGame();
      window.removeEventListener("resize", calculateBlockSize);
      window.removeEventListener("keydown", handleKeyPress);
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
.tetris-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #581c87, #1e3a8a);
  padding: 0.5rem;
}

.game-wrapper {
  background-color: #111827;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 1rem;
  width: 100%;
  max-width: 42rem;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
  text-align: center;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.sidebar {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.score-box {
  background-color: #1f2937;
  padding: 0.5rem;
  border-radius: 0.5rem;
  flex: 1;
}

.label {
  color: white;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.value {
  font-size: 1.25rem;
  font-weight: bold;
}

.score {
  color: #fbbf24;
}

.high-score {
  color: #34d399;
}

.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.board {
  border: 2px solid #374151;
  background-color: #000;
  gap: 1px;
  background-color: #111;
}

.board-row {
  display: flex;
  gap: 1px;
}

.cell {
  box-sizing: border-box;
}

.btn {
  width: 100%;
  margin-top: 0.75rem;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-start,
.btn-restart {
  background-color: #059669;
  color: white;
}

.btn-start:hover,
.btn-restart:hover {
  background-color: #047857;
}

.btn-start:active,
.btn-restart:active {
  background-color: #065f46;
}

.game-over {
  margin-top: 0.75rem;
  width: 100%;
}

.game-over-text {
  background-color: #dc2626;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.paused {
  margin-top: 0.75rem;
  background-color: #ca8a04;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
  width: 100%;
  max-width: 20rem;
}

.btn-control {
  font-weight: bold;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1.125rem;
}

.btn-move {
  background-color: #2563eb;
}

.btn-move:hover {
  background-color: #1d4ed8;
}

.btn-move:active {
  background-color: #1e40af;
}

.btn-rotate {
  background-color: #9333ea;
}

.btn-rotate:hover {
  background-color: #7e22ce;
}

.btn-rotate:active {
  background-color: #6b21a8;
}

.btn-pause {
  background-color: #ca8a04;
  font-size: 0.875rem;
}

.btn-pause:hover {
  background-color: #a16207;
}

.btn-pause:active {
  background-color: #854d0e;
}

.btn-drop {
  background-color: #dc2626;
}

.btn-drop:hover {
  background-color: #b91c1c;
}

.btn-drop:active {
  background-color: #991b1b;
}

.btn-soft {
  background-color: #2563eb;
  font-size: 0.875rem;
}

.btn-soft:hover {
  background-color: #1d4ed8;
}

.btn-soft:active {
  background-color: #1e40af;
}

.instructions {
  margin-top: 0.75rem;
  background-color: #1f2937;
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.75rem;
}

.inst-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.inst-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 1rem;
}

@media (min-width: 640px) {
  .game-wrapper {
    padding: 1.5rem;
  }

  .title {
    font-size: 2.25rem;
    margin-bottom: 1rem;
  }

  .content {
    flex-direction: row;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .sidebar {
    flex-direction: column;
    width: auto;
  }

  .score-box {
    padding: 0.75rem;
  }

  .label {
    font-size: 0.875rem;
  }

  .value {
    font-size: 1.5rem;
  }

  .board {
    border: 4px solid #374151;
  }

  .btn {
    font-size: 1rem;
  }

  .game-over-text,
  .paused {
    font-size: 1rem;
  }

  .btn-pause,
  .btn-soft {
    font-size: 1rem;
  }

  .instructions {
    font-size: 0.875rem;
  }
}
</style>
