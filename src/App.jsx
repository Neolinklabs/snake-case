import { useState, useEffect, useRef, useCallback } from 'react'
import GameCanvas from './components/GameCanvas'
import { INITIAL_SPEED, SPEED_INCREMENT, DIRECTIONS } from './utils/constants'
import { useSound } from './hooks/useSound'
import { getLeaderboard, addToLeaderboard, isTop10 } from './utils/storage'
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
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const scoreRef = useRef(0)

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
    scoreRef.current = newScore
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
    scoreRef.current = 0
    setGameOver(false)
    setPaused(false)
    setLevel(1)
    levelRef.current = 1
    setResetKey((k) => k + 1)
    setShowNameInput(false)
    setPlayerName('')
  }

  const handleSubmitName = () => {
    if (playerName.trim()) {
      addToLeaderboard(playerName.trim(), scoreRef.current)
      setShowNameInput(false)
      setPlayerName('')
    }
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
      <button className="leaderboard-btn" onClick={() => setShowLeaderboard(true)}>
        🏆 排行榜
      </button>
      <GameCanvas
        onScore={handleScore}
        onGameOver={() => {
          setGameOver(true)
          setPaused(false)
          if (scoreRef.current > 0 && isTop10(scoreRef.current)) {
            setShowNameInput(true)
          }
        }}
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
          {showNameInput ? (
            <div className="name-input-area">
              <p className="congrats-text">🎉 恭喜进入前 10 名！</p>
              <div className="name-input-row">
                <input
                  className="name-input"
                  type="text"
                  maxLength={10}
                  placeholder="输入你的名字"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitName()}
                  autoFocus
                />
                <button className="submit-name-btn" onClick={handleSubmitName}>确认</button>
              </div>
            </div>
          ) : null}
          <button className="restart-btn" onClick={handleRestart}>
            重新开始
          </button>
        </div>
      )}
      {showLeaderboard && (
        <div className="modal-overlay" onClick={() => setShowLeaderboard(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🏆 排行榜 Top 10</h2>
            {getLeaderboard().length === 0 ? (
              <p className="empty-board">暂无记录</p>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>玩家</th>
                    <th>分数</th>
                    <th>日期</th>
                  </tr>
                </thead>
                <tbody>
                  {getLeaderboard().map((entry, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{entry.name}</td>
                      <td>{entry.score}</td>
                      <td>{entry.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="close-modal-btn" onClick={() => setShowLeaderboard(false)}>关闭</button>
          </div>
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
