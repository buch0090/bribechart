import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchChores, checkin } from '../api'
import ChoreCard from '../components/ChoreCard'
import BribeBank from '../components/BribeBank'

export default function Dashboard() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(() => {
    fetchChores(decodedName)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [decodedName]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCheckin = async (choreId) => {
    await checkin(decodedName, choreId);
    // Refresh after a brief moment to let animation play
    setTimeout(loadData, 1500);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '3rem' }}>
          💫
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <button className="back-button" onClick={() => navigate('/')}>← Back</button>
        <div style={{ background: '#FFE3E3', color: '#C92A2A', padding: 20, borderRadius: 16, textAlign: 'center' }}>
          😕 {error}
        </div>
      </div>
    );
  }

  const todayChores = data.chores.filter(c => c.frequency === 'daily');
  const weeklyChores = data.chores.filter(c => c.frequency === 'weekly');
  const allDoneToday = todayChores.every(c => c.completed_today);
  const allDoneWeekly = weeklyChores.every(c => c.completed_this_week);

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <button className="back-button" onClick={() => navigate('/')}>← Home</button>

      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ textAlign: 'center', marginBottom: 24 }}
      >
        <h1 className="page-title">Hey {decodedName}! 🎯</h1>
        <p className="page-subtitle">
          {allDoneToday && allDoneWeekly
            ? "You're all done! Amazing! 🌟"
            : "Let's crush some chores!"}
        </p>
      </motion.div>

      <BribeBank total={data.totalEarned} chores={data.chores} />

      {todayChores.length > 0 && (
        <>
          <SectionHeader title="Today's Tasks" emoji="📅" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {todayChores.map((chore, i) => (
              <ChoreCard key={chore.chore_id} chore={chore} onCheckin={handleCheckin} index={i} />
            ))}
          </div>
        </>
      )}

      {weeklyChores.length > 0 && (
        <>
          <SectionHeader title="This Week" emoji="📆" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {weeklyChores.map((chore, i) => (
              <ChoreCard key={chore.chore_id} chore={chore} onCheckin={handleCheckin} index={i + todayChores.length} />
            ))}
          </div>
        </>
      )}

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/leaderboard')}
        style={{
          width: '100%',
          padding: '14px',
          background: 'linear-gradient(135deg, #FFD43B, #FF922B)',
          color: 'white',
          borderRadius: 16,
          fontSize: '1.05rem',
          fontWeight: 600,
          boxShadow: '0 4px 15px rgba(255, 146, 43, 0.25)',
          marginBottom: 20,
        }}
      >
        🏆 View Leaderboard
      </motion.button>
    </motion.div>
  );
}

function SectionHeader({ title, emoji }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
      fontSize: '1.15rem',
      fontWeight: 600,
      color: '#636E72',
    }}>
      <span>{emoji}</span>
      <span>{title}</span>
    </div>
  );
}
