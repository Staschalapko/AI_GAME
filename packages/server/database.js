const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function initializeDatabase() {
  const db = await open({
    filename: './chat.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_rooms (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
  `);

  console.log('Database initialized successfully');
  return db;
}

module.exports = { initializeDatabase };