require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query } = require('./db');
const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const createEvaluationsRouter = require('./routes/evaluations');
const aiRouter = require('./routes/ai');
const developmentRouter = require('./routes/development');

function createApp({ queryFn = query } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', async (req, res) => {
    try {
      await queryFn('SELECT 1');
      return res.json({ ok: true, database: 'connected' });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
  });

  app.use('/api/players', playersRouter);
  app.use('/api/teams', teamsRouter);
  app.use('/api/evaluations', createEvaluationsRouter(queryFn));
  app.use('/api/ai', aiRouter);
  app.use('/api/development', developmentRouter);

  return app;
}

module.exports = { createApp };
