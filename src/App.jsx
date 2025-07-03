// App.js
import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import "bootstrap/dist/css/bootstrap.min.css";

const clickSound = new Audio("https://www.fesliyanstudios.com/play-mp3/3873");
const winSound = new Audio("https://www.fesliyanstudios.com/play-mp3/387");
const turnSound = new Audio("https://www.fesliyanstudios.com/play-mp3/3872");

const App = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [theme, setTheme] = useState("light");
  const [winner, setWinner] = useState(null);
  const [mode, setMode] = useState("AI"); // AI or Human
  const [difficulty, setDifficulty] = useState("Hard");
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("scores");
    return saved ? JSON.parse(saved) : { X: 0, O: 0, Draws: 0 };
  });

  useEffect(() => {
    if (mode === "AI" && !isXTurn && !winner) {
      const timeout = setTimeout(() => {
        const move = getAIMove(board, difficulty);
        if (move !== -1) handleClick(move);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isXTurn, board, winner, mode, difficulty]);

  useEffect(() => {
    const result = getWinner(board);
    if (result) {
      setWinner(result);
      winSound.play();
      const updated = { ...scores, [result]: scores[result] + 1 };
      setScores(updated);
      localStorage.setItem("scores", JSON.stringify(updated));
    } else if (!board.includes(null)) {
      setWinner("Draw");
      const updated = { ...scores, Draws: scores.Draws + 1 };
      setScores(updated);
      localStorage.setItem("scores", JSON.stringify(updated));
    }
  }, [board]);

  const handleClick = (index) => {
    if (board[index] || winner) return;
    clickSound.play();
    turnSound.pause();
    turnSound.currentTime = 0;
    turnSound.play();
    const newBoard = [...board];
    newBoard[index] = isXTurn ? "X" : "O";
    setBoard(newBoard);
    setIsXTurn(!isXTurn);
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
    handleReset();
    const resetScores = { X: 0, O: 0, Draws: 0 };
    setScores(resetScores);
    localStorage.setItem("scores", JSON.stringify(resetScores));
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  const boxClass = theme === "light" ? "bg-light text-dark" : "bg-dark text-white";

  return (
    <div className={`container text-center py-4 ${theme === "dark" ? "bg-dark text-white" : ""}`}>
      {winner && winner !== "Draw" && <Confetti numberOfPieces={300} />}
      <h1 className="mb-3">🎮 Tic-Tac-Toe Game</h1>

      <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
        <button className="btn btn-outline-secondary" onClick={toggleTheme}>
          Toggle {theme === "light" ? "Dark" : "Light"} Mode
        </button>

        <select value={mode} onChange={handleModeChange} className="form-select w-auto">
          <option value="AI">🧠 Human vs AI</option>
          <option value="Human">🧍 Human vs Human</option>
        </select>

        {mode === "AI" && (
          <select value={difficulty} onChange={handleDifficultyChange} className="form-select w-auto">
            <option value="Easy">😅 Easy</option>
            <option value="Medium">🤔 Medium</option>
            <option value="Hard">🧠 Hard</option>
          </select>
        )}
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 d-flex flex-wrap border border-3 rounded-3">
          {board.map((value, index) => (
            <div
              key={index}
              onClick={() => (mode === "Human" || isXTurn) && !winner && handleClick(index)}
              className={`col-4 border border-2 d-flex justify-content-center align-items-center fw-bold ${boxClass}`}
              style={{ height: "100px", fontSize: "2.5rem", cursor: "pointer" }}
            >
              {value}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3">
        {winner === "Draw" ? (
          <h4 className="text-warning">It's a Draw! 🙌</h4>
        ) : winner ? (
          <h4 className="text-success">🎉 Winner: {winner}</h4>
        ) : (
          <h4>Next Turn: {isXTurn ? "❌ X" : "⭕ O"}</h4>
        )}
        <button className="btn btn-primary mt-2" onClick={handleReset}>
          🔁 Restart Game
        </button>
      </div>

      <div className="mt-3">
        <h5>📊 Scoreboard</h5>
        <div className="d-flex justify-content-center gap-4 mt-2 flex-wrap">
          <div className="border rounded p-2">❌ X: {scores.X}</div>
          <div className="border rounded p-2">⭕ O: {scores.O}</div>
          <div className="border rounded p-2">🤝 Draws: {scores.Draws}</div>
        </div>
      </div>
    </div>
  );
};

// --- Game Logic ---
const getWinner = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const getAIMove = (board, difficulty) => {
  if (difficulty === "Easy") {
    const moves = board.map((v, i) => (v ? null : i)).filter(v => v !== null);
    return moves[Math.floor(Math.random() * moves.length)];
  }
  if (difficulty === "Medium" && Math.random() < 0.5) {
    const moves = board.map((v, i) => (v ? null : i)).filter(v => v !== null);
    return moves[Math.floor(Math.random() * moves.length)];
  }
  return getBestMove(board);
};

const getBestMove = (board) => {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};

const minimax = (board, depth, isMaximizing) => {
  const winner = getWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (!board.includes(null)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return best;
  }
};

export default App;