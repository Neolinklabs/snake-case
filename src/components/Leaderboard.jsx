function Leaderboard({ entries, onBack }) {
  return (
    <div className="leaderboard">
      <h2>排行榜</h2>
      {entries.length === 0 ? (
        <p className="leaderboard-empty">暂无记录</p>
      ) : (
        <ol className="leaderboard-list">
          {entries.map((entry, i) => (
            <li key={entry.date} className="leaderboard-item">
              <span className="leaderboard-rank">{i + 1}</span>
              <span className="leaderboard-name">{entry.name}</span>
              <span className="leaderboard-score">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
      <button className="back-btn" onClick={onBack}>返回游戏</button>
    </div>
  )
}

export default Leaderboard
