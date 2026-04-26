import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login } from '../api'

export default function PinEntry() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDigit = (d) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      setLoading(true);
      login(decodeURIComponent(name), newPin)
        .then(() => {
          navigate(`/dashboard/${name}`, { replace: true });
        })
        .catch(() => {
          setError(true);
          setPin('');
          setLoading(false);
        });
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

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
        <h1 className="page-title">Hi {decodeURIComponent(name)}! 👋</h1>
        <p className="page-subtitle">Enter your secret PIN</p>
      </div>

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
                ? (error ? 'var(--coral)' : 'var(--sky)')
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
          Nope! Try again 😝
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
          <NumButton key={d} label={d} onClick={() => handleDigit(String(d))} disabled={loading} />
        ))}
        <div />
        <NumButton label={0} onClick={() => handleDigit('0')} disabled={loading} />
        <NumButton label="⌫" onClick={handleDelete} disabled={loading} variant="delete" />
      </div>
    </motion.div>
  );
}

function NumButton({ label, onClick, disabled, variant }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 20,
        fontSize: variant === 'delete' ? '1.5rem' : '1.8rem',
        fontWeight: 600,
        background: variant === 'delete'
          ? 'rgba(0,0,0,0.05)'
          : 'var(--card-bg)',
        backdropFilter: 'blur(10px)',
        boxShadow: 'var(--shadow)',
        color: '#2D3436',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </motion.button>
  );
}
