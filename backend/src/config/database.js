const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  // In-memory SQLite keeps the test suite fast and self-contained, without
  // requiring a real Postgres instance to be running in CI or locally.
  // See AI_NOTES.md for why this is safe for this project.
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
} else if (process.env.DATABASE_URL) {
  // Hosted Postgres providers (Neon, Supabase, Render, ...) hand out a single
  // connection string instead of separate host/user/password values, and
  // require TLS. `sslmode=require` in the URL isn't enough on its own for
  // Sequelize/pg - it also needs `ssl` set here, with cert checks relaxed
  // since these providers use certs that aren't in Node's default CA store.
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'sweety',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
}

module.exports = sequelize;
