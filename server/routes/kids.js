const express = require('express');
const router = express.Router();
const { getRows } = require('../sheets');

// GET /api/kids — list kids (no PINs exposed)
router.get('/', async (req, res) => {
  try {
    const kids = await getRows('Kids');
    res.json(kids.map(k => ({ name: k.name, avatar: k.avatar })));
  } catch (err) {
    console.error('Error fetching kids:', err.message);
    res.status(500).json({ error: 'Failed to load kids' });
  }
});

// POST /api/login — verify PIN
router.post('/login', async (req, res) => {
  try {
    const { name, pin } = req.body;
    const kids = await getRows('Kids');
    const kid = kids.find(k => k.name.toLowerCase() === name.toLowerCase());
    if (!kid) return res.status(404).json({ error: 'Kid not found' });
    if (kid.pin !== pin) return res.status(401).json({ error: 'Wrong PIN' });
    res.json({ name: kid.name, avatar: kid.avatar });
  } catch (err) {
    console.error('Error logging in:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
