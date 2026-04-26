import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchLeaderboard } from '../api'

const trophies = ['🥇', '🥈', '🥉'];
const rankColors = ['#FFD43B', '#ADB5BD', '#FF922B'];

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard()
      .then(setBoard)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button className="back-button" onClick={() => navigate('/')}>← Home</button>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '3rem', marginBottom: 4 }}>🏆</div>
        <h1 className="page-title">Leaderboard</h1>
        <p className="page-subtitle">Who's earning the most?</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '2.5rem', display: 'inline-block' }}>💫</motion.div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {board.map((kid, i) => (
            <motion.div
              key={kid.name}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              style={{
                background: i < 3
                  ? `linear-gradient(135deg, ${rankColors[i]}15, ${rankColors[i]}30)`
                  : 'var(--card-bg)',
                border: i < 3 ? `2px solid ${rankColors[i]}55` : '2px solid rgba(0,0,0,0.05)',
                borderRadius: 20,
                padding: 20,
                boxShadow: 'var(--shadow)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {/* Rank */}
              <div style={{
                fontSize: i < 3 ? '2rem' : '1.3rem',
                fontWeight: 700,
                width: 48,
                textAlign: 'center',
                color: i < 3 ? rankColors[i] : '#636E72',
              }}>
                {i < 3 ? trophies[i] : `#${i + 1}`}
              </div>

              {/* Avatar + name */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '1.8rem' }}>{kid.avatar}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{kid.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem', color: '#636E72', flexWrap: 'wrap' }}>
                  <span>🔥 Best streak: {kid.bestStreak}</span>
                  <span>✅ {kid.totalCompletions} done</span>
                </div>
              </div>

              {/* Total earned */}
              <div style={{
                textAlign: 'right',
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#FF922B',
                }}>
                  ${kid.totalEarned.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#636E72' }}>earned</div>
              </div>
            </motion.div>
          ))}

          {board.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#636E72' }}>
              No data yet! Start checking in to see the leaderboard 🚀
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
