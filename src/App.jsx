import { useState, useEffect } from 'react'
import GameCanvas from './components/GameCanvas'
import './App.css'

function getHighScore() {
  return parseInt(localStorage.getItem('snakeHighScore') || '0', 10)
}

function App() {
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(getHighScore)
  const [scoreBump, setScoreBump] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('snakeHighScore', String(score))
    }
  }, [score, highScore])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !gameOver) {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver])

  const handleScore = (newScore) => {
    setScore(newScore)
    setScoreBump(true)
    setTimeout(() => setScoreBump(false), 200)
  }

  const handleGameOver = () => {
    setGameOver(true)
    setPaused(false)
  }

  return (
    <div className="app">
      <h1>贪吃蛇</h1>
      <div className="score-panel">
        <div className={`score ${scoreBump ? 'bump' : ''}`}>
          分数: {score}
        </div>
        <div className="high-score">
          最高分: {highScore}
        </div>
      </div>
      <GameCanvas onScore={handleScore} onGameOver={handleGameOver} gameOver={gameOver} paused={paused} />
      {!gameOver && (
        <button className="pause-btn" onClick={() => setPaused((p) => !p)}>
          {paused ? '继续' : '暂停'}
        </button>
      )}
      {gameOver && (
        <div className="game-over-overlay">
          <p>游戏结束！最终得分: {score}</p>
        </div>
      )}
    </div>
  )
}

export default App
