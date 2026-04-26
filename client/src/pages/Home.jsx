import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchKids } from '../api'

const cardColors = ['#FF6B6B', '#51CF66', '#339AF0', '#CC5DE8', '#FF922B', '#FFD43B'];

export default function Home() {
  const [kids, setKids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKids()
      .then(setKids)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>💰</div>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Bribe Tracker</h1>
        <p className="page-subtitle">Who's checking in today?</p>
      </motion.div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, width: '100%', maxWidth: 500 }}>
        {kids.map((kid, i) => (
          <motion.button
            key={kid.name}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/login/${encodeURIComponent(kid.name)}`)}
            style={{
              background: `linear-gradient(135deg, ${cardColors[i % cardColors.length]}22, ${cardColors[i % cardColors.length]}44)`,
              border: `3px solid ${cardColors[i % cardColors.length]}66`,
              borderRadius: 24,
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              boxShadow: 'var(--shadow)',
              transition: 'box-shadow 0.3s',
            }}
          >
            <span style={{ fontSize: '4rem' }}>{kid.avatar}</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 600, color: '#2D3436' }}>{kid.name}</span>
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => navigate('/leaderboard')}
        style={{
          marginTop: 40,
          background: 'linear-gradient(135deg, #FFD43B, #FF922B)',
          color: 'white',
          padding: '14px 32px',
          borderRadius: 50,
          fontSize: '1.1rem',
          fontWeight: 600,
          boxShadow: '0 4px 15px rgba(255, 146, 43, 0.3)',
        }}
      >
        🏆 Leaderboard
      </motion.button>
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ fontSize: '2.5rem', display: 'inline-block' }}
      >
        💫
      </motion.div>
      <p style={{ marginTop: 12, color: '#636E72', fontSize: '1.1rem' }}>Loading...</p>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div style={{
      background: '#FFE3E3',
      color: '#C92A2A',
      padding: '16px 24px',
      borderRadius: 16,
      textAlign: 'center',
      marginBottom: 20,
      fontWeight: 500,
    }}>
      😕 {message}
    </div>
  );
}
