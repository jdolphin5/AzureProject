const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Initialize SQLite database (in-memory for this example)
const db = new sqlite3.Database(':memory:');

// Create the "users" table and insert sample users
db.serialize(() => {
  // Create the table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    access_level INTEGER NOT NULL
  )`);

  // Insert sample users
  const insertStmt = db.prepare(`INSERT INTO users (name, access_level) VALUES (?, ?)`);
  insertStmt.run('Alice', 5);
  insertStmt.run('Bob', 3);
  insertStmt.run('Charlie', 1);
  insertStmt.finalize();
});

// REST API Endpoints

// Create a new user (POST /users)
app.post('/users', (req, res) => {
  const { name, access_level } = req.body;

  if (!name || access_level === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, access_level' });
  }

  const stmt = db.prepare(`INSERT INTO users (name, access_level) VALUES (?, ?)`);
  stmt.run(name, access_level, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'User created', userId: this.lastID });
    }
  });
  stmt.finalize();
});

// Get a user by ID (GET /users/:id)
app.get('/users/:id', (req, res) => {
  const id = req.params.id;

  db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.status(200).json(row);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Get all users (GET /users)
app.get('/users', (req, res) => {
    db.all(`SELECT * FROM users`, (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (row) {
        res.status(200).json(row);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    });
  });

// Delete a user by ID (DELETE /users/:id)
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;

  db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes > 0) {
      res.status(200).json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
