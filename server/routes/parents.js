const express = require('express');
const router = express.Router();
const { getRows, getLogs } = require('../sheets');
const { calculateProgress } = require('../utils/streaks');

// GET /api/parents — list parents (no PINs)
router.get('/', async (req, res) => {
  try {
    const parents = await getRows('Parents');
    res.json(parents.map(p => ({ name: p.name, avatar: p.avatar || '👨‍👩‍👧‍👦' })));
  } catch (err) {
    console.error('Error fetching parents:', err.message);
    res.status(500).json({ error: 'Failed to load parents' });
  }
});

// POST /api/parents/login — verify parent PIN
router.post('/login', async (req, res) => {
  try {
    const { name, pin } = req.body;
    const parents = await getRows('Parents');
    const parent = parents.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    if (parent.pin !== pin) return res.status(401).json({ error: 'Wrong PIN' });
    res.json({ name: parent.name, avatar: parent.avatar || '👨‍👩‍👧‍👦' });
  } catch (err) {
    console.error('Error logging in parent:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/parents/dashboard — all kids' full progress
router.get('/dashboard', async (req, res) => {
  try {
    const [kids, chores] = await Promise.all([
      getRows('Kids'),
      getRows('Chores'),
    ]);
    const logs = getLogs();

    const kidData = kids.map(kid => {
      const kidChores = chores.filter(c => {
        const assigned = c.assigned_to.toLowerCase();
        return assigned === 'all' || assigned.split(',').map(s => s.trim().toLowerCase()).includes(kid.name.toLowerCase());
      });

      const progress = calculateProgress(logs, kidChores, kid.name);
      const totalCompletions = logs.filter(l => l.kid_name === kid.name && l.status === 'done').length;
      const bestStreak = Math.max(0, ...progress.chores.map(c => c.current_streak));

      // Recent activity (last 10)
      const recentLogs = logs
        .filter(l => l.kid_name === kid.name && l.status === 'done')
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 10)
        .map(l => {
          const chore = kidChores.find(c => c.id === l.chore_id);
          return {
            date: l.date,
            timestamp: l.timestamp,
            chore_id: l.chore_id,
            chore_title: chore ? chore.title : l.chore_id,
            chore_emoji: chore ? chore.emoji : '✅',
          };
        });

      return {
        name: kid.name,
        avatar: kid.avatar,
        totalEarned: progress.totalEarned,
        totalCompletions,
        bestStreak,
        chores: progress.chores,
        recentActivity: recentLogs,
      };
    });

    // Summary stats
    const totalOwed = kidData.reduce((sum, k) => sum + k.totalEarned, 0);
    const totalCheckins = logs.filter(l => l.status === 'done').length;

    res.json({ kids: kidData, totalOwed, totalCheckins });
  } catch (err) {
    console.error('Error fetching parent dashboard:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;
