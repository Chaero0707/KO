// 게임 상태
let gameState = {
    board: [], // 19x19 바둑판
    currentPlayer: 'black', // 현재 플레이어
    playerColor: null, // 플레이어의 색
    gameActive: false,
    passCount: 0,
    capturedBlack: 0,
    capturedWhite: 0,
    moveHistory: []
};

// 캔버스 설정
const canvas = document.getElementById('badukBoard');
const ctx = canvas.getContext('2d');
const BOARD_SIZE = 19;
const CELL_SIZE = 30;
const STONE_RADIUS = 13;

// 게임 시작
function startGame(color) {
    gameState.playerColor = color;
    gameState.currentPlayer = 'black'; // 흑이 항상 먼저
    gameState.gameActive = true;
    gameState.passCount = 0;
    gameState.capturedBlack = 0;
    gameState.capturedWhite = 0;
    gameState.moveHistory = [];
    
    // 바둑판 초기화
    gameState.board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
    
    // UI 업데이트
    document.getElementById('startPanel').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'grid';
    document.getElementById('scorePanel').style.display = 'none';
    
    drawBoard();
    updateGameStatus();
    
    // 플레이어가 백이면 AI가 먼저 둔다
    if (color === 'white') {
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

// 바둑판 그리기
function drawBoard() {
    // 배경
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 선
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        // 가로선
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE, CELL_SIZE + i * CELL_SIZE);
        ctx.lineTo(CELL_SIZE + (BOARD_SIZE - 1) * CELL_SIZE, CELL_SIZE + i * CELL_SIZE);
        ctx.stroke();
        
        // 세로선
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE + i * CELL_SIZE, CELL_SIZE);
        ctx.lineTo(CELL_SIZE + i * CELL_SIZE, CELL_SIZE + (BOARD_SIZE - 1) * CELL_SIZE);
        ctx.stroke();
    }
    
    // 별(점)
    const starPoints = [3, 9, 15];
    ctx.fillStyle = '#000';
    starPoints.forEach(i => {
        starPoints.forEach(j => {
            ctx.beginPath();
            ctx.arc(CELL_SIZE + i * CELL_SIZE, CELL_SIZE + j * CELL_SIZE, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    
    // 돌 그리기
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            drawStone(i, j, gameState.board[i][j]);
        }
    }
}

// 돌 그리기
function drawStone(row, col, color) {
    if (!color) return;
    
    const x = CELL_SIZE + col * CELL_SIZE;
    const y = CELL_SIZE + row * CELL_SIZE;
    
    ctx.beginPath();
    ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color === 'black' ? '#000' : '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// 캔버스 클릭
canvas.addEventListener('click', (e) => {
    if (!gameState.gameActive || gameState.currentPlayer !== gameState.playerColor) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.round((x - CELL_SIZE) / CELL_SIZE);
    const row = Math.round((y - CELL_SIZE) / CELL_SIZE);
    
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
    
    makeMove(row, col, gameState.playerColor);
});

// 돌 놓기
function makeMove(row, col, color) {
    if (gameState.board[row][col] !== null) {
        alert('이미 돌이 있습니다!');
        return;
    }
    
    gameState.board[row][col] = color;
    gameState.moveHistory.push({row, col, color});
    gameState.passCount = 0;
    
    // 상대 돌 제거 (포획)
    captureOpponentStones(row, col, color);
    
    // 자살 수 확인
    if (!hasLiberty(row, col)) {
        gameState.board[row][col] = null;
        gameState.moveHistory.pop();
        alert('자살 수입니다!');
        return;
    }
    
    drawBoard();
    gameState.currentPlayer = gameState.currentPlayer === 'black' ? 'white' : 'black';
    updateGameStatus();
    
    // AI 턴 처리
    if (gameState.gameActive && gameState.currentPlayer !== gameState.playerColor) {
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

// 자유도 확인
function hasLiberty(row, col) {
    const color = gameState.board[row][col];
    const visited = new Set();
    
    function dfs(r, c) {
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
        const key = `${r},${c}`;
        if (visited.has(key)) return false;
        visited.add(key);
        
        if (gameState.board[r][c] === null) return true;
        if (gameState.board[r][c] !== color) return false;
        
        return dfs(r+1, c) || dfs(r-1, c) || dfs(r, c+1) || dfs(r, c-1);
    }
    
    return dfs(row, col);
}

// 상대 돌 포획
function captureOpponentStones(row, col, color) {
    const opponent = color === 'black' ? 'white' : 'black';
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    directions.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (gameState.board[nr][nc] === opponent && !hasLiberty(nr, nc)) {
                removeStoneGroup(nr, nc);
            }
        }
    });
}

// 돌 그룹 제거
function removeStoneGroup(row, col) {
    const color = gameState.board[row][col];
    gameState.board[row][col] = null;
    
    if (color === 'black') {
        gameState.capturedBlack++;
    } else {
        gameState.capturedWhite++;
    }
    
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    directions.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (gameState.board[nr][nc] === color) {
                removeStoneGroup(nr, nc);
            }
        }
    });
}

// AI 수 두기
function makeAIMove() {
    const move = getAIMove();
    
    if (move === null) {
        // Pass
        gameState.passCount++;
        if (gameState.passCount >= 2) {
            // 두 명 모두 Pass 하면 계가
            calculateScore();
            return;
        }
        gameState.currentPlayer = gameState.playerColor;
        updateGameStatus();
        document.getElementById('aiMoveDisplay').textContent = 'AI 수: Pass';
        return;
    }
    
    makeMove(move.row, move.col, gameState.currentPlayer);
    document.getElementById('aiMoveDisplay').textContent = `AI 수: ${positionToNotation(move.row, move.col)}`;
    
    // memo.json에 저장
    saveMoveToMemo(move);
}

// 좌표를 바둑 기보로 변환
function positionToNotation(row, col) {
    const files = 'abcdefghijklmnopqrs';
    return files[col] + (BOARD_SIZE - row);
}

// Pass 버튼
function passMove() {
    if (!gameState.gameActive || gameState.currentPlayer !== gameState.playerColor) return;
    
    gameState.passCount++;
    
    if (gameState.passCount >= 2) {
        calculateScore();
        return;
    }
    
    gameState.currentPlayer = gameState.currentPlayer === 'black' ? 'white' : 'black';
    updateGameStatus();
    
    if (gameState.currentPlayer !== gameState.playerColor) {
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

// 기권
function resign() {
    const loser = gameState.playerColor;
    const winner = loser === 'black' ? 'white' : 'black';
    
    gameState.gameActive = false;
    
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('scorePanel').style.display = 'block';
    document.getElementById('scoreResult').textContent = `${winner === 'black' ? '흑' : '백'} 승리!\n${loser === 'black' ? '흑' : '백'}이(가) 기권했습니다.`;
}

// 게임 상태 업데이트
function updateGameStatus() {
    const turnPlayer = gameState.currentPlayer === 'black' ? '흑' : '백';
    const playerColor = gameState.playerColor === 'black' ? '흑' : '백';
    
    document.getElementById('turnInfo').textContent = `${turnPlayer}의 차례`;
    document.getElementById('playerColor').textContent = `플레이어: ${playerColor}`;
    document.getElementById('scoreInfo').textContent = `흑 포획: ${gameState.capturedBlack} | 백 포획: ${gameState.capturedWhite}`;
    
    // 피드백 버튼 활성화/비활성화
    const goodBtn = document.getElementById('goodBtn');
    const badBtn = document.getElementById('badBtn');
    
    if (gameState.currentPlayer === gameState.playerColor) {
        goodBtn.disabled = true;
        badBtn.disabled = true;
    } else {
        goodBtn.disabled = false;
        badBtn.disabled = false;
    }
}

// 게임 리셋
function resetGame() {
    gameState.gameActive = false;
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('scorePanel').style.display = 'none';
    document.getElementById('startPanel').style.display = 'flex';
    document.getElementById('gameStatus').textContent = '게임 대기 중...';
}

// 평가 함수 (AI 학습용)
function rateMoveGood() {
    // database.json에 좋은 수로 저장
    if (gameState.moveHistory.length > 0) {
        const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
        saveGameData('good', lastMove);
    }
}

function rateMoveBad() {
    // database.json에 나쁜 수로 저장
    if (gameState.moveHistory.length > 0) {
        const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
        saveGameData('bad', lastMove);
    }
}

// 데이터 저장 함수 (나중에 서버와 연동)
function saveGameData(rating, move) {
    console.log(`Move ${positionToNotation(move.row, move.col)} rated as ${rating}`);
}

function saveMoveToMemo(move) {
    console.log(`AI move saved: ${positionToNotation(move.row, move.col)}`);
}
