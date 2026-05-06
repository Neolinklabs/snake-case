import { useState, useEffect, useRef } from 'react'
import GameCanvas from './components/GameCanvas'
import { INITIAL_SPEED, SPEED_INCREMENT } from './utils/constants'
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
  const [level, setLevel] = useState(1)
  const [resetKey, setResetKey] = useState(0)
  const levelRef = useRef(1)

  const speed = Math.max(50, INITIAL_SPEED - (level - 1) * SPEED_INCREMENT)

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

  const handleLevelUp = () => {
    const newLevel = levelRef.current + 1
    levelRef.current = newLevel
    setLevel(newLevel)
  }

  const handleRestart = () => {
    setScore(0)
    setGameOver(false)
    setPaused(false)
    setLevel(1)
    levelRef.current = 1
    setResetKey((k) => k + 1)
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
        <div className="level">
          等级: {level}
        </div>
      </div>
      <GameCanvas
        onScore={handleScore}
        onGameOver={() => { setGameOver(true); setPaused(false) }}
        onLevelUp={handleLevelUp}
        gameOver={gameOver}
        paused={paused}
        speed={speed}
        resetKey={resetKey}
      />
      {!gameOver && (
        <button className="pause-btn" onClick={() => setPaused((p) => !p)}>
          {paused ? '继续' : '暂停'}
        </button>
      )}
      {gameOver && (
        <div className="game-over-overlay">
          <p>游戏结束！最终得分: {score}</p>
          <button className="restart-btn" onClick={handleRestart}>
            重新开始
          </button>
        </div>
      )}
    </div>
  )
}

export default App
