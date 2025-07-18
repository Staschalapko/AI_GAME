const express = require('express');
const bcrypt = require('bcryptjs');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    
    if (!username || !password || !nickname) {
      return res.status(400).json({ 
        error: 'Username, password, and nickname are required' 
      });
    }
    
    const { open } = require('sqlite');
    const sqlite3 = require('sqlite3').verbose();
    const db = await open({
      filename: './chat.db',
      driver: sqlite3.Database
    });
    
    const existingUser = await db.get(
      'SELECT username FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUser) {
      await db.close();
      return res.status(409).json({ 
        error: 'Username already exists' 
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await db.run(
      'INSERT INTO users (username, password_hash, nickname) VALUES (?, ?, ?)',
      [username, passwordHash, nickname]
    );
    
    await db.close();
    
    res.status(201).json({ 
      message: 'User registered successfully' 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();