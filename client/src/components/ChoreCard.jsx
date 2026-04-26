import { useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import StreakRing from './StreakRing'

const streakColors = ['#FF6B6B', '#FF922B', '#FFD43B', '#51CF66', '#339AF0', '#CC5DE8'];

export default function ChoreCard({ chore, onCheckin, index }) {
  const [checking, setChecking] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const isDone = chore.frequency === 'daily' ? chore.completed_today : chore.completed_this_week;
  const color = streakColors[index % streakColors.length];

  const handleCheckin = async () => {
    if (isDone || checking || justCheckedIn) return;
    setChecking(true);
    try {
      await onCheckin(chore.chore_id);
      setJustCheckedIn(true);

      // Small confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF6B6B', '#51CF66', '#FFD43B', '#339AF0', '#CC5DE8'],
      });

      // Big celebration if streak goal just hit
      if (chore.current_streak + 1 >= chore.streak_goal) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            startVelocity: 40,
            origin: { y: 0.5 },
            colors: ['#FFD700', '#FF6B6B', '#51CF66'],
          });
        }, 500);
      }
    } finally {
      setChecking(false);
    }
  };

  const showDone = isDone || justCheckedIn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        padding: 20,
        boxShadow: 'var(--shadow)',
        border: `2px solid ${showDone ? '#51CF6644' : color + '33'}`,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        transition: 'border-color 0.3s',
      }}
    >
      {/* Streak ring */}
      <StreakRing
        current={showDone && !isDone ? chore.current_streak + 1 : chore.current_streak}
        goal={chore.streak_goal}
        color={color}
        size={68}
      />

      {/* Chore info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: '1.4rem' }}>{chore.emoji}</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{chore.title}</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#636E72', marginBottom: 6 }}>
          {chore.frequency === 'daily' ? '📅 Every day' : '📆 Weekly'} · 
          {chore.current_streak > 0 && (
            <span> 🔥 {chore.current_streak} streak · </span>
          )}
          <span style={{ color: '#51CF66', fontWeight: 600 }}>
            ${chore.bribe_amount.toFixed(2)} reward
          </span>
        </div>
        {chore.total_earned > 0 && (
          <div style={{ fontSize: '0.8rem', color: '#FF922B', fontWeight: 500 }}>
            💰 Earned ${chore.total_earned.toFixed(2)} so far!
          </div>
        )}
      </div>

      {/* Check-in button */}
      <motion.button
        whileHover={!showDone ? { scale: 1.1 } : {}}
        whileTap={!showDone ? { scale: 0.85 } : {}}
        onClick={handleCheckin}
        disabled={showDone || checking}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: showDone
            ? 'linear-gradient(135deg, #51CF66, #40C057)'
            : `linear-gradient(135deg, ${color}, ${color}CC)`,
          color: 'white',
          fontSize: showDone ? '1.5rem' : '1.3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: showDone
            ? '0 4px 12px rgba(81, 207, 102, 0.3)'
            : `0 4px 12px ${color}44`,
          flexShrink: 0,
          opacity: checking ? 0.6 : 1,
        }}
      >
        {showDone ? '✓' : '💪'}
      </motion.button>
    </motion.div>
  );
}
