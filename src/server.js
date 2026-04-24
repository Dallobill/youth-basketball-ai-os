require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query } = require('./db');
const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const evaluationsRouter = require('./routes/evaluations');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    return res.json({ ok: true, database: 'connected' });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/evaluations', evaluationsRouter);
app.use('/api/ai', aiRouter);

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
