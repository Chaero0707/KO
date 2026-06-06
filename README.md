# Ko - 한국식 바둑 AI

HTML, JavaScript, CSS로 만든 한국식 바둑 게임 AI입니다.

## 특징

✅ **한국식 바둑 규칙** - 한국식 계가 시스템 (덤돌 6.5子)
✅ **색 선택** - 흑 또는 백 선택 가능 (흑이 먼저)
✅ **AI 학습 시스템** - 좋아요/싫어요 버튼으로 AI가 점점 똑똑해짐
✅ **자동 계가** - 두 명 모두 Pass하면 자동 계가
✅ **기권 기능** - 언제든지 기권 가능
✅ **데이터 저장** - 모든 게임 데이터는 database.json에 저장
✅ **수 기록** - AI가 둔 수는 memo.json에 저장

## 게임 화면

- 19x19 바둑판
- 실시간 점수 표시
- AI 수 화면 표시
- 턴 표시 (흑/백)

## 설치 및 실행

### 필요한 것
- Node.js (v14 이상)

### 설치
```bash
npm install express
```

### 실행
```bash
node server.js
```

브라우저에서 `http://localhost:3000` 에 접속하세요.

## 게임 방법

1. **색 선택**: 흑 또는 백을 선택합니다 (흑이 먼저 둡니다)
2. **돌 놓기**: 바둑판을 클릭하여 돌을 놓습니다
3. **AI 평가**: 
   - 👍 **좋아요**: AI의 수가 좋으면 누릅니다 (AI 학습)
   - 👎 **싫어요**: AI의 수가 나쁘면 누릅니다 (AI 학습)
4. **계가하기**: 둘 다 Pass하면 자동 계가되거나, 버튼으로 수동 계가
5. **기권**: 언제든지 기권할 수 있습니다

## 파일 구조

```
ko/
├── index.html              # 메인 HTML
├── css/
│   └── style.css          # 스타일
├── js/
│   ├── game.js            # 게임 로직
│   ├── ai.js              # AI 로직
│   └── utils.js           # 유틸리티 (계가 등)
├── data/
│   ├── database.json      # 게임 데이터 저장
│   └── memo.json          # AI 수 기록
└── server.js              # Node.js 서버
```

## 한국식 바둑 규칙

- **돌 제거**: 모든 자유도를 잃은 돌 그룹은 제거됨
- **자살 수**: 자유도가 없는 곳에 돌을 놓을 수 없음
- **계가**: 점유한 영역 + 포획한 돌
  - **흑**: 영역 + 포획한 백돌
  - **백**: 영역 + 포획한 흑돌 + 6.5 (덤돌)

## AI 학습 시스템

AI는 두 가지 방식으로 학습합니다:

1. **기본 전략**: 중앙, 상대 공격, 아군 연결
2. **학습된 경험**: 플레이어의 좋아요/싫어요 평가

AI가 둔 수를 평가하면 `database.json`의 `ai_training_data`에 저장되어
다음 게임부터 AI가 더 좋은 수를 두게 됩니다.

## 저장된 데이터

### database.json
```json
{
  "games": [
    {
      "date": "2026-06-06T...",
      "playerColor": "black",
      "blackScore": 120.5,
      "whiteScore": 114,
      "winner": "흑",
      "moveHistory": [...]
    }
  ],
  "ai_training_data": {
    "good_moves": [...],
    "bad_moves": [...]
  }
}
```

### memo.json
```json
{
  "moves": [
    {
      "timestamp": "2026-06-06T...",
      "row": 3,
      "col": 3,
      "color": "white",
      "notation": "d16"
    }
  ]
}
```

## 라이선스

MIT License

---

**개발자**: Chaero0707  
**언어**: HTML, JavaScript, CSS, Node.js
