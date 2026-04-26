const express = require('express');
const router = express.Router();
const { getRows, getLogs } = require('../sheets');
const { calculateProgress } = require('../utils/streaks');

// GET /api/chores/:kid — get chores + progress for a kid
router.get('/:kid', async (req, res) => {
  try {
    const kidName = req.params.kid;
    const chores = await getRows('Chores');
    const logs = getLogs();

    // Filter chores assigned to this kid
    const kidChores = chores.filter(c => {
      const assigned = c.assigned_to.toLowerCase();
      return assigned === 'all' || assigned.split(',').map(s => s.trim().toLowerCase()).includes(kidName.toLowerCase());
    });

    const progress = calculateProgress(logs, kidChores, kidName);
    res.json(progress);
  } catch (err) {
    console.error('Error fetching chores:', err.message);
    res.status(500).json({ error: 'Failed to load chores' });
  }
});

module.exports = router;
