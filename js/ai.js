// AI 무비 생성
function getAIMove() {
    const availableMoves = [];
    
    // 모든 빈 자리 찾기
    for (let i = 0; i < 19; i++) {
        for (let j = 0; j < 19; j++) {
            if (gameState.board[i][j] === null) {
                availableMoves.push({row: i, col: j});
            }
        }
    }
    
    if (availableMoves.length === 0) {
        return null; // Pass
    }
    
    // AI 전략
    const aiColor = gameState.currentPlayer;
    const opponentColor = aiColor === 'black' ? 'white' : 'black';
    
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let move of availableMoves) {
        let score = evaluateMove(move.row, move.col, aiColor, opponentColor);
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    // 학습된 데이터에서 수 추천 확인
    const learnedMove = getLearnedMove(aiColor);
    if (learnedMove && isValidMove(learnedMove.row, learnedMove.col)) {
        return learnedMove;
    }
    
    return bestMove || availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// 수 평가
function evaluateMove(row, col, aiColor, opponentColor) {
    let score = 0;
    
    // 보드 중앙에 가까우면 높은 점수
    const centerDistance = Math.abs(row - 9) + Math.abs(col - 9);
    score += (18 - centerDistance) * 0.5;
    
    // 상대 돌 근처면 점수 증가 (공격)
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let opponentNear = 0;
    directions.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 19 && nc >= 0 && nc < 19) {
            if (gameState.board[nr][nc] === opponentColor) {
                opponentNear++;
            }
        }
    });
    score += opponentNear * 2;
    
    // 아군 돌 근처면 점수 증가 (연결)
    let friendlyNear = 0;
    directions.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 19 && nc >= 0 && nc < 19) {
            if (gameState.board[nr][nc] === aiColor) {
                friendlyNear++;
            }
        }
    });
    score += friendlyNear * 1;
    
    // 난수 추가 (변화)
    score += Math.random() * 2;
    
    return score;
}

// 학습된 수 가져오기
function getLearnedMove(aiColor) {
    // database.json에서 좋은 평가를 받은 수 찾기
    // 현재는 로컬 스토리지 사용
    const learned = localStorage.getItem('learned_moves');
    if (learned) {
        const moves = JSON.parse(learned);
        const goodMoves = moves.filter(m => m.rating === 'good' && m.color === aiColor);
        if (goodMoves.length > 0) {
            return goodMoves[Math.floor(Math.random() * goodMoves.length)];
        }
    }
    return null;
}

// 유효한 수 확인
function isValidMove(row, col) {
    return row >= 0 && row < 19 && col >= 0 && col < 19 && gameState.board[row][col] === null;
}

// AI 수 평가 저장 (학습)
function saveLearnedMove(row, col, color, rating) {
    let learned = localStorage.getItem('learned_moves');
    let moves = learned ? JSON.parse(learned) : [];
    
    moves.push({
        row: row,
        col: col,
        color: color,
        rating: rating,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('learned_moves', JSON.stringify(moves));
}

// AI 학습 활성화 (평가 버튼 클릭 시)
function recordAIFeedback(rating) {
    if (gameState.moveHistory.length < 2) return;
    
    // 마지막 AI 수 찾기
    let aiMoveIndex = gameState.moveHistory.length - 2;
    if (gameState.playerColor === 'black') {
        aiMoveIndex = gameState.moveHistory.length - 1;
    }
    
    if (aiMoveIndex >= 0) {
        const move = gameState.moveHistory[aiMoveIndex];
        const aiColor = move.color;
        saveLearnedMove(move.row, move.col, aiColor, rating);
    }
}
