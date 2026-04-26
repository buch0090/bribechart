import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchParents, parentLogin } from '../api'

export default function ParentPinEntry() {
  const navigate = useNavigate();
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParents()
      .then(p => {
        setParents(p);
        if (p.length === 1) setSelectedParent(p[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDigit = (d) => {
    if (pin.length >= 4 || !selectedParent) return;
    const newPin = pin + d;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      parentLogin(selectedParent.name, newPin)
        .then(() => navigate('/parent/dashboard', { replace: true }))
        .catch(() => {
          setError(true);
          setPin('');
        });
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

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
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      <button className="back-button" onClick={() => navigate('/')} style={{ alignSelf: 'flex-start' }}>
        ← Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔐</div>
        <h1 className="page-title">Parent Login</h1>
        <p className="page-subtitle">Enter your PIN</p>
      </div>

      {/* Parent select if multiple */}
      {parents.length > 1 && !selectedParent && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {parents.map(p => (
            <motion.button
              key={p.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedParent(p)}
              style={{
                background: 'var(--card-bg)',
                border: '2px solid rgba(0,0,0,0.08)',
                borderRadius: 16,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: 'var(--shadow)',
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{p.avatar}</span>
              {p.name}
            </motion.button>
          ))}
        </div>
      )}

      {selectedParent && (
        <>
          {parents.length > 1 && (
            <button
              onClick={() => { setSelectedParent(null); setPin(''); setError(false); }}
              style={{
                background: 'none',
                color: '#636E72',
                fontSize: '0.9rem',
                marginBottom: 16,
                textDecoration: 'underline',
              }}
            >
              {selectedParent.avatar} {selectedParent.name} — switch
            </button>
          )}

          {/* PIN dots */}
          <motion.div
            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', gap: 16, marginBottom: 32 }}
          >
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={pin.length > i ? { scale: [0.8, 1.2, 1] } : {}}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: pin.length > i
                    ? (error ? 'var(--coral)' : 'var(--lavender)')
                    : 'rgba(0,0,0,0.1)',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: 'var(--coral)', fontWeight: 600, marginBottom: 16, fontSize: '1.1rem' }}
            >
              Wrong PIN! 🔒
            </motion.p>
          )}

          {/* Number pad */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            maxWidth: 280,
            width: '100%',
          }}>
            {[1,2,3,4,5,6,7,8,9].map(d => (
              <NumButton key={d} label={d} onClick={() => handleDigit(String(d))} />
            ))}
            <div />
            <NumButton label={0} onClick={() => handleDigit('0')} />
            <NumButton label="⌫" onClick={handleDelete} variant="delete" />
          </div>
        </>
      )}
    </motion.div>
  );
}

function NumButton({ label, onClick, variant }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 20,
        fontSize: variant === 'delete' ? '1.5rem' : '1.8rem',
        fontWeight: 600,
        background: variant === 'delete' ? 'rgba(0,0,0,0.05)' : 'var(--card-bg)',
        backdropFilter: 'blur(10px)',
        boxShadow: 'var(--shadow)',
        color: '#2D3436',
      }}
    >
      {label}
    </motion.button>
  );
}
