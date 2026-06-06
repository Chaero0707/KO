// 계가 함수 (한국식 계가)
function calculateScore() {
    gameState.gameActive = false;
    
    // 영역 계산
    const scores = countTerritory();
    
    const blackScore = scores.blackTerritory + gameState.capturedWhite;
    const whiteScore = scores.whiteTerritory + gameState.capturedBlack + 6.5; // 백의 덤돌(덤을 6.5子)
    
    // 결과 표시
    const winner = blackScore > whiteScore ? '흑' : whiteScore > blackScore ? '백' : '무승부';
    const resultText = `
        <div style="font-size: 1.2em; margin: 10px 0;">
            <div>흑 점수: ${blackScore.toFixed(1)} (영역: ${scores.blackTerritory} + 포획: ${gameState.capturedWhite})</div>
            <div>백 점수: ${whiteScore.toFixed(1)} (영역: ${scores.whiteTerritory} + 포획: ${gameState.capturedBlack} + 덤: 6.5)</div>
            <div style="margin-top: 20px; font-size: 1.5em; font-weight: bold;">
                ${winner === '무승부' ? '무승부!' : `${winner} 승리!`}
            </div>
            ${winner !== '무승부' ? `<div style="margin-top: 10px;">${Math.abs(blackScore - whiteScore).toFixed(1)}집 차이</div>` : ''}
        </div>
    `;
    
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('scorePanel').style.display = 'block';
    document.getElementById('scoreResult').innerHTML = resultText;
    
    // 게임 결과 저장
    saveGameResult({
        blackScore: blackScore,
        whiteScore: whiteScore,
        winner: winner,
        blackTerritory: scores.blackTerritory,
        whiteTerritory: scores.whiteTerritory,
        capturedBlack: gameState.capturedBlack,
        capturedWhite: gameState.capturedWhite,
        moveHistory: gameState.moveHistory
    });
}

// 영역 계산 (한국식)
function countTerritory() {
    const visited = Array(19).fill().map(() => Array(19).fill(false));
    let blackTerritory = 0;
    let whiteTerritory = 0;
    
    for (let i = 0; i < 19; i++) {
        for (let j = 0; j < 19; j++) {
            if (!visited[i][j] && gameState.board[i][j] === null) {
                const territory = floodFill(i, j, visited);
                
                if (territory.owner === 'black') {
                    blackTerritory += territory.size;
                } else if (territory.owner === 'white') {
                    whiteTerritory += territory.size;
                }
                // 중립 영역은 누구 것도 아님
            }
        }
    }
    
    return {
        blackTerritory: blackTerritory,
        whiteTerritory: whiteTerritory
    };
}

// 영역 탐색
function floodFill(startRow, startCol, visited) {
    const queue = [[startRow, startCol]];
    const territory = [];
    let owners = new Set();
    
    while (queue.length > 0) {
        const [row, col] = queue.shift();
        
        if (row < 0 || row >= 19 || col < 0 || col >= 19 || visited[row][col]) {
            continue;
        }
        
        visited[row][col] = true;
        
        if (gameState.board[row][col] === null) {
            territory.push([row, col]);
            
            const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            directions.forEach(([dr, dc]) => {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < 19 && nc >= 0 && nc < 19) {
                    if (!visited[nr][nc]) {
                        if (gameState.board[nr][nc] !== null) {
                            owners.add(gameState.board[nr][nc]);
                        } else {
                            queue.push([nr, nc]);
                        }
                    }
                }
            });
        }
    }
    
    // 영역의 주인 결정
    let owner = 'neutral';
    if (owners.size === 1) {
        owner = owners.values().next().value;
    }
    
    return {
        size: territory.length,
        owner: owner,
        cells: territory
    };
}

// 게임 결과 저장
function saveGameResult(result) {
    let gameHistory = localStorage.getItem('game_history');
    let history = gameHistory ? JSON.parse(gameHistory) : [];
    
    history.push({
        date: new Date().toISOString(),
        playerColor: gameState.playerColor,
        result: result
    });
    
    localStorage.setItem('game_history', JSON.stringify(history));
    
    // database.json 형식으로 변환 (실제 서버에 저장할 때)
    console.log('Game saved:', result);
}

// 평가 버튼 업데이트
const originalRateMoveGood = rateMoveGood;
const originalRateMoveBad = rateMoveBad;

window.rateMoveGood = function() {
    recordAIFeedback('good');
    alert('좋은 수로 평가했습니다! AI가 학습합니다.');
    originalRateMoveGood();
};

window.rateMoveBad = function() {
    recordAIFeedback('bad');
    alert('나쁜 수로 평가했습니다! AI가 다른 방식으로 학습합니다.');
    originalRateMoveBad();
};
