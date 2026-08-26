require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

app.use(express.json());

// Postgres connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create table and seed data on startup
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN DEFAULT false
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*) as count FROM tasks');
  if (parseInt(rows[0].count) === 0) {
    await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Buy groceries', false]);
    await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Clean the house', false]);
    await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Write documentation', true]);
    console.log('3 example tasks inserted.');
  }
}

// GET /tasks - return all tasks (with optional search, filter, sort)
app.get('/tasks', async (req, res) => {
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (req.query.search) {
    params.push(`%${req.query.search}%`);
    query += ` AND title LIKE $${params.length}`;
  }

  if (req.query.done !== undefined) {
    params.push(req.query.done === 'true');
    query += ` AND done = $${params.length}`;
  }

  if (req.query.sort === 'title') {
    query += ' ORDER BY title ASC';
  } else {
    query += ' ORDER BY id ASC';
  }

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// GET /tasks/:id - return one task
app.get('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(rows[0]);
});

// POST /tasks - insert new task
app.post('/tasks', async (req, res) => {
  const { title, done } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const { rows } = await pool.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
    [title.trim(), done || false]
  );

  res.status(201).json(rows[0]);
});

// PUT /tasks/:id - update task
app.put('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, done } = req.body;

  const { rows: existing } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  const updatedTitle = title !== undefined ? title.trim() : existing[0].title;
  const updatedDone = done !== undefined ? done : existing[0].done;

  const { rows } = await pool.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
    [updatedTitle, updatedDone, id]
  );

  res.json(rows[0]);
});

// DELETE /tasks/:id - delete task
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  const { rows: existing } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.status(204).send();
});

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
