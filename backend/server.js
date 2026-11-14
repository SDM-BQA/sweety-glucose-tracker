require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

async function start() {
  // alter:true lets sync add new columns (e.g. role, doctorId) to tables
  // that already exist from an earlier run, without a separate migration
  // step. See AI_NOTES.md for the migration-free tradeoff this app makes.
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => console.log(`Sweety API listening on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
