import { motion } from 'framer-motion'

export default function BribeBank({ total, chores }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: 'spring' }}
      style={{
        background: 'linear-gradient(135deg, #FFD43B22, #FF922B22)',
        border: '2px solid #FFD43B66',
        borderRadius: 24,
        padding: 24,
        textAlign: 'center',
        marginBottom: 24,
      }}
    >
      <div style={{ fontSize: '1rem', fontWeight: 500, color: '#636E72', marginBottom: 4 }}>
        💰 Bribe Bank
      </div>
      <motion.div
        key={total}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#FF922B',
          marginBottom: 8,
        }}
      >
        ${total.toFixed(2)}
      </motion.div>
      <div style={{ fontSize: '0.85rem', color: '#636E72' }}>
        earned so far — keep it up! 🚀
      </div>

      {/* Breakdown */}
      {chores.filter(c => c.total_earned > 0).length > 0 && (
        <div style={{
          marginTop: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
        }}>
          {chores.filter(c => c.total_earned > 0).map(c => (
            <span
              key={c.chore_id}
              style={{
                background: 'rgba(255,255,255,0.7)',
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              {c.emoji} ${c.total_earned.toFixed(2)}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
