    const COLS = 10;
    const ROWS = 20;

    const levelSpeed = [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100]; // ms per drop

    const shapes = {
      I: [[1, 1, 1, 1]],
      O: [[1, 1], [1, 1]],
      T: [[0, 1, 0], [1, 1, 1]],
      L: [[1, 0, 0], [1, 1, 1]],
      J: [[0, 0, 1], [1, 1, 1]],
      S: [[0, 1, 1], [1, 1, 0]],
      Z: [[1, 1, 0], [0, 1, 1]]
    };

    const shapeColors = {
      I: 'aqua',
      O: 'yellow',
      T: 'purple',
      L: 'orange',
      J: 'blue',
      S: 'lime',
      Z: 'red'
    };

    let board = [];
    let grid = [];
    let currentPiece;
    let interval;
    let level = 1;
    let score = 0;
    let timeLeft = 60; // 60 seconds
    let timerInterval;

    function createGrid() {
      const tetris = document.getElementById('tetris');
      for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
          const div = document.createElement('div');
          div.classList.add('cell');
          tetris.appendChild(div);
          grid[r][c] = div;
          board[r][c] = { filled: 0, color: null };
        }
      }
    }

    function randomShape() {
      const keys = Object.keys(shapes);
      const key = keys[Math.floor(Math.random() * keys.length)];
      const shape = shapes[key];
      return { shape, row: 0, col: 3, type: key };
    }

    function drawBoard() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = board[r][c];
          if (cell.filled === 1) {
            grid[r][c].classList.add('filled');
            grid[r][c].style.backgroundColor = cell.color;
          } else {
            grid[r][c].classList.remove('filled');
            grid[r][c].style.backgroundColor = '#222';
          }
        }
      }
    }

    function drawPiece(piece, fill = true) {
      const color = shapeColors[piece.type];
      piece.shape.forEach((row, rIdx) => {
        row.forEach((val, cIdx) => {
          if (val) {
            const r = piece.row + rIdx;
            const c = piece.col + cIdx;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
              grid[r][c].classList.toggle('filled', fill);
              grid[r][c].style.backgroundColor = fill ? color : '#222';
            }
          }
        });
      });
    }

    function canMove(piece, dRow, dCol) {
      return piece.shape.every((row, rIdx) =>
        row.every((val, cIdx) => {
          if (!val) return true;
          const r = piece.row + rIdx + dRow;
          const c = piece.col + cIdx + dCol;
          if (r >= ROWS || c < 0 || c >= COLS) return false;
          if (r >= 0 && board[r][c].filled === 1) return false;
          return true;
        })
      );
    }

    function freezePiece(piece) {
      const color = shapeColors[piece.type];
      piece.shape.forEach((row, rIdx) => {
        row.forEach((val, cIdx) => {
          if (val) {
            const r = piece.row + rIdx;
            const c = piece.col + cIdx;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
              board[r][c] = { filled: 1, color };
            }
          }
        });
      });
    }

    function removeLines() {
      let lines = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell.filled === 1)) {
          lines++;
          board.splice(r, 1);
          board.unshift(Array.from({ length: COLS }, () => ({ filled: 0, color: null })));
          r++; // aynı satırı tekrar kontrol et
        }
      }
      if (lines > 0) {
        score += lines * 100;
        document.getElementById('score').textContent = score;
        const newLevel = Math.min(10, Math.floor(score / 500) + 1);
        if (newLevel !== level) {
          level = newLevel;
          document.getElementById('level').textContent = level;
          clearInterval(interval);
          interval = setInterval(gameLoop, levelSpeed[level - 1]);
        }
        drawBoard();
      }
    }

    function updateTimer() {
      timeLeft--;
      document.getElementById('timer').textContent = timeLeft;
      
      if (timeLeft <= 0) {
        document.getElementById('game-over').innerHTML = '<img src="timer.png" alt="Timer" style="width: 50px; height: 50px; vertical-align: middle; margin-right: 10px;">Time is up!';
        document.getElementById('game-over').style.display = 'block';
        clearInterval(interval);
        clearInterval(timerInterval);
      }
    }

    function gameLoop() {
      if (canMove(currentPiece, 1, 0)) {
        drawPiece(currentPiece, false);
        currentPiece.row++;
        drawPiece(currentPiece, true);
      } else {
        freezePiece(currentPiece);
        removeLines();

        // ✅ Kazanma kontrolü
        if (level === 10 && score >= 4500) {
          document.getElementById('game-over').textContent = 'Üzümlü kekim harikasın!';
          document.getElementById('game-over').style.display = 'block';
          clearInterval(interval);
          clearInterval(timerInterval);
          return;
        }

        currentPiece = randomShape();
        if (!canMove(currentPiece, 0, 0)) {
          document.getElementById('game-over').textContent = 'Ah çok şanssızsın!';
          document.getElementById('game-over').style.display = 'block';
          clearInterval(interval);
          clearInterval(timerInterval);
        } else {
          drawPiece(currentPiece, true);
        }
      }
    }

    document.addEventListener('keydown', (e) => {
      if (!currentPiece) return;
      drawPiece(currentPiece, false);
      if (e.key === 'ArrowLeft' && canMove(currentPiece, 0, -1)) {
        currentPiece.col--;
      } else if (e.key === 'ArrowRight' && canMove(currentPiece, 0, 1)) {
        currentPiece.col++;
      } else if (e.key === 'ArrowDown' && canMove(currentPiece, 1, 0)) {
        currentPiece.row++;
      }
      drawPiece(currentPiece, true);
    });

    // Başlat
    createGrid();
    currentPiece = randomShape();
    drawPiece(currentPiece, true);
    interval = setInterval(gameLoop, levelSpeed[0]);
    timerInterval = setInterval(updateTimer, 1000); // Update timer every second
