import { useState, useEffect, useRef, useCallback } from 'react'
import GameCanvas from './components/GameCanvas'
import { INITIAL_SPEED, SPEED_INCREMENT, DIRECTIONS } from './utils/constants'
import { useSound } from './hooks/useSound'
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
  const changeDirRef = useRef(null)
  const { playEat, playGameOver, playTurn, muted, toggleMute } = useSound()

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

  const handleDirectionReady = useCallback((fn) => {
    changeDirRef.current = fn
  }, [])

  const handleDir = (dir) => {
    if (changeDirRef.current) changeDirRef.current(dir)
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
      <button className="mute-btn" onClick={toggleMute}>
        {muted ? '🔇' : '🔊'}
      </button>
      <GameCanvas
        onScore={handleScore}
        onGameOver={() => { setGameOver(true); setPaused(false) }}
        onLevelUp={handleLevelUp}
        gameOver={gameOver}
        paused={paused}
        speed={speed}
        resetKey={resetKey}
        onDirectionReady={handleDirectionReady}
        playEat={playEat}
        playGameOver={playGameOver}
        playTurn={playTurn}
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
      <div className="dpad">
        <button className="dpad-btn dpad-up" onTouchStart={(e) => { e.preventDefault(); handleDir(DIRECTIONS.UP) }} onClick={() => handleDir(DIRECTIONS.UP)}>&#9650;</button>
        <div className="dpad-row">
          <button className="dpad-btn" onTouchStart={(e) => { e.preventDefault(); handleDir(DIRECTIONS.LEFT) }} onClick={() => handleDir(DIRECTIONS.LEFT)}>&#9664;</button>
          <button className="dpad-btn" onTouchStart={(e) => { e.preventDefault(); handleDir(DIRECTIONS.RIGHT) }} onClick={() => handleDir(DIRECTIONS.RIGHT)}>&#9654;</button>
        </div>
        <button className="dpad-btn dpad-down" onTouchStart={(e) => { e.preventDefault(); handleDir(DIRECTIONS.DOWN) }} onClick={() => handleDir(DIRECTIONS.DOWN)}>&#9660;</button>
      </div>
    </div>
  )
}

export default App
