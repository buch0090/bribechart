const express = require('express');
const router = express.Router();
const { getRows, getLogs } = require('../sheets');
const { calculateProgress } = require('../utils/streaks');

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const [kids, chores] = await Promise.all([
      getRows('Kids'),
      getRows('Chores'),
    ]);
    const logs = await getLogs();

    const leaderboard = kids.map(kid => {
      const kidChores = chores.filter(c => {
        const assigned = c.assigned_to.toLowerCase();
        return assigned === 'all' || assigned.split(',').map(s => s.trim().toLowerCase()).includes(kid.name.toLowerCase());
      });

      const progress = calculateProgress(logs, kidChores, kid.name);

      const bestStreak = Math.max(0, ...progress.chores.map(c => c.current_streak));
      const totalCompletions = logs.filter(l => l.kid_name === kid.name && l.status === 'done').length;

      return {
        name: kid.name,
        avatar: kid.avatar,
        totalEarned: progress.totalEarned,
        bestStreak,
        totalCompletions,
        chores: progress.chores,
      };
    });

    leaderboard.sort((a, b) => b.totalEarned - a.totalEarned);
    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err.message);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

module.exports = router;
