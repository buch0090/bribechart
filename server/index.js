require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/kids', require('./routes/kids'));
app.use('/api/chores', require('./routes/chores'));
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/parents', require('./routes/parents'));

// Serve static frontend
const distPath = path.join(__dirname, '../client/dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('🎉 Bribe Tracker API is running! Open <a href="http://localhost:5173">http://localhost:5173</a> for the app.');
  });
}

app.listen(PORT, () => {
  console.log(`🎉 Bribe Tracker server running on http://localhost:${PORT}`);
});
