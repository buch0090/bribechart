import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchParentDashboard } from '../api'
import StreakRing from '../components/StreakRing'

const streakColors = ['#FF6B6B', '#FF922B', '#FFD43B', '#51CF66', '#339AF0', '#CC5DE8'];

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedKid, setExpandedKid] = useState(null);

  useEffect(() => {
    fetchParentDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '3rem' }}>💫</motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button className="back-button" onClick={() => navigate('/')}>← Home</button>

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>👨‍👩‍👧‍👦</div>
        <h1 className="page-title">Parent Dashboard</h1>
        <p className="page-subtitle">How the kids are doing</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 }}>
        <SummaryCard label="Total Owed" value={`$${data.totalOwed.toFixed(2)}`} emoji="💸" color="#FF922B" />
        <SummaryCard label="Total Check-ins" value={data.totalCheckins} emoji="✅" color="#51CF66" />
      </div>

      {/* Per-kid breakdown */}
      {data.kids.map((kid, kidIdx) => (
        <motion.div
          key={kid.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: kidIdx * 0.1 }}
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            boxShadow: 'var(--shadow)',
            marginBottom: 16,
            overflow: 'hidden',
          }}
        >
          {/* Kid header — always visible */}
          <button
            onClick={() => setExpandedKid(expandedKid === kid.name ? null : kid.name)}
            style={{
              width: '100%',
              background: 'none',
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>{kid.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{kid.name}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem', color: '#636E72', flexWrap: 'wrap', marginTop: 4 }}>
                <span>💰 ${kid.totalEarned.toFixed(2)} earned</span>
                <span>🔥 {kid.bestStreak} best streak</span>
                <span>✅ {kid.totalCompletions} done</span>
              </div>
            </div>
            <motion.span
              animate={{ rotate: expandedKid === kid.name ? 180 : 0 }}
              style={{ fontSize: '1.2rem', color: '#636E72' }}
            >
              ▼
            </motion.span>
          </button>

          {/* Expanded detail */}
          {expandedKid === kid.name && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              style={{ padding: '0 20px 20px' }}
            >
              {/* Chore progress */}
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#636E72', marginBottom: 12 }}>
                📋 Chore Progress
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {kid.chores.map((chore, i) => {
                  const isDone = chore.frequency === 'daily' ? chore.completed_today : chore.completed_this_week;
                  const color = streakColors[i % streakColors.length];
                  return (
                    <div
                      key={chore.chore_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        background: isDone ? '#51CF6610' : 'rgba(0,0,0,0.02)',
                        borderRadius: 14,
                        border: `1.5px solid ${isDone ? '#51CF6633' : 'rgba(0,0,0,0.04)'}`,
                      }}
                    >
                      <StreakRing current={chore.current_streak} goal={chore.streak_goal} size={48} color={color} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{chore.emoji}</span>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{chore.title}</span>
                          {isDone && <span style={{ fontSize: '0.75rem', background: '#51CF66', color: 'white', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>Done ✓</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#636E72', marginTop: 2 }}>
                          {chore.frequency === 'daily' ? 'Daily' : 'Weekly'} ·
                          Streak {chore.current_streak}/{chore.streak_goal} ·
                          <span style={{ color: '#FF922B', fontWeight: 500 }}> ${chore.bribe_amount.toFixed(2)} reward</span>
                          {chore.total_earned > 0 && (
                            <span style={{ color: '#51CF66', fontWeight: 500 }}> · ${chore.total_earned.toFixed(2)} earned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent activity */}
              {kid.recentActivity.length > 0 && (
                <>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#636E72', marginBottom: 10 }}>
                    🕐 Recent Activity
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {kid.recentActivity.map((log, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          background: 'rgba(0,0,0,0.02)',
                          borderRadius: 10,
                          fontSize: '0.85rem',
                        }}
                      >
                        <span>{log.chore_emoji}</span>
                        <span style={{ flex: 1, fontWeight: 500 }}>{log.chore_title}</span>
                        <span style={{ color: '#636E72', fontSize: '0.8rem' }}>{formatDate(log.date)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {kid.recentActivity.length === 0 && (
                <div style={{ textAlign: 'center', color: '#636E72', padding: '12px 0', fontSize: '0.9rem' }}>
                  No activity yet — time to get started! 🚀
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

function SummaryCard({ label, value, emoji, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: `${color}12`,
        border: `2px solid ${color}33`,
        borderRadius: 20,
        padding: 20,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#636E72', fontWeight: 500 }}>{label}</div>
    </motion.div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
