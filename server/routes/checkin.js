const express = require('express');
const router = express.Router();
const { getLogs, appendLog } = require('../sheets');
const { getToday } = require('../utils/streaks');

// POST /api/checkin — kid marks a chore done
router.post('/', async (req, res) => {
  try {
    const { kid_name, chore_id } = req.body;
    if (!kid_name || !chore_id) {
      return res.status(400).json({ error: 'kid_name and chore_id are required' });
    }

    const today = getToday();

    // Check for duplicate
    const logs = await getLogs();
    const duplicate = logs.find(
      l => l.kid_name === kid_name && l.chore_id === chore_id && l.date === today && l.status === 'done'
    );
    if (duplicate) {
      return res.status(409).json({ error: 'Already checked in for this chore today' });
    }

    // Append to local log
    appendLog({
      timestamp: new Date().toISOString(),
      kid_name,
      chore_id,
      date: today,
      status: 'done',
    });

    res.json({ success: true, message: 'Check-in recorded! 🎉' });
  } catch (err) {
    console.error('Error checking in:', err.message);
    res.status(500).json({ error: 'Check-in failed' });
  }
});

module.exports = router;
