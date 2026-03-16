// game.js —— 终极修复版（2025年4月5日验证通过）
class SnakeGame {
    constructor() {
        this.boardSize = 20;
        this.cellSize = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.direction = { x: 0, y: 0 };
        this.pendingDirection = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameOver = false;
        this.gameInterval = null;

        this.init();
    }

    init() {
        this.renderBoard();
        this.updateHighScoreDisplay();
        this.startGame();
    }

    renderBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;

        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.setAttribute('data-x', x);
                cell.setAttribute('data-y', y);
                board.appendChild(cell);
            }
        }
        this.updateDisplay();
    }

    updateDisplay() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => cell.className = 'cell');

        this.snake.forEach((segment, index) => {
            const cell = document.querySelector(`.cell[data-x="${segment.x}"][data-y="${segment.y}"]`);
            if (cell) cell.className = 'cell snake';
        });

        const foodCell = document.querySelector(`.cell[data-x="${this.food.x}"][data-y="${this.food.y}"]`);
        if (foodCell) foodCell.className = 'cell food';
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.boardSize),
                y: Math.floor(Math.random() * this.boardSize)
            };
        } while (this.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        return newFood;
    }

    moveSnake() {
        if (this.gameOver) return;

        if (this.pendingDirection.x !== 0 || this.pendingDirection.y !== 0) {
            this.direction = { ...this.pendingDirection };
            this.pendingDirection = { x: 0, y: 0 };
        }

        if (this.direction.x === 0 && this.direction.y === 0) return;

        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        if (head.x < 0 || head.x >= this.boardSize || head.y < 0 || head.y >= this.boardSize) {
            this.endGame();
            return;
        }

        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.food = this.generateFood();
            this.updateScoreDisplay();
        } else {
            this.snake.pop();
        }

        this.updateDisplay();
    }

    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }

    updateHighScoreDisplay() {
        document.getElementById('high-score').textContent = this.highScore;
    }

    endGame() {
        this.gameOver = true;
        clearInterval(this.gameInterval);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
        alert(`游戏结束！得分：${this.score}`);
    }

    startGame() {
        this.gameInterval = setInterval(() => this.moveSnake(), 150);
    }

    // ✅ 修复版：精准判断是否为反向
    changeDirection(key) {
        const keyMap = {
            'ArrowUp': { x: 0, y: -1 },
            'ArrowDown': { x: 0, y: 1 },
            'ArrowLeft': { x: -1, y: 0 },
            'ArrowRight': { x: 1, y: 0 },
            'w': { x: 0, y: -1 },
            's': { x: 0, y: 1 },
            'a': { x: -1, y: 0 },
            'd': { x: 1, y: 0 }
        };

        const dir = keyMap[key];
        if (!dir) return;

        // ✅ 正确：判断“你按下的方向”是否与“当前移动方向”相反
        if (dir.x === -this.direction.x && dir.y === -this.direction.y) {
            return; // 禁止直接反向
        }

        this.pendingDirection = dir;
    }

    reset() {
        clearInterval(this.gameInterval);
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.pendingDirection = { x: 0, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.updateScoreDisplay();
        this.renderBoard();
        this.startGame();
    }
}

// 事件绑定（独立于类）
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();

    window.addEventListener('keydown', e => {
        const key = e.key;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key)) {
            e.preventDefault();
            game.changeDirection(key);
        }
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        game.reset();
    });

    const gameBoard = document.getElementById('game-board');
    gameBoard.tabIndex = 0;
    gameBoard.addEventListener('click', () => gameBoard.focus());
});
