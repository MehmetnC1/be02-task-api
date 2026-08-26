const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Stage 0: Create SQLite database and table
const db = new Database(path.join(__dirname, 'tasks.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done BOOLEAN DEFAULT 0
  )
`);

// Insert example tasks only if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run('Buy groceries', 0);
  insert.run('Clean the house', 0);
  insert.run('Write documentation', 1);
  console.log('3 example tasks inserted.');
}

// Stage 1: Read from database
// GET /tasks - return all tasks (with optional search, filter, sort)
app.get('/tasks', (req, res) => {
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  // Search by title (SQL LIKE)
  if (req.query.search) {
    query += ' AND title LIKE ?';
    params.push(`%${req.query.search}%`);
  }

  // Filter by done status
  if (req.query.done !== undefined) {
    const doneValue = req.query.done === 'true' ? 1 : 0;
    query += ' AND done = ?';
    params.push(doneValue);
  }

  // Sort
  if (req.query.sort === 'title') {
    query += ' ORDER BY title ASC';
  } else {
    query += ' ORDER BY id ASC';
  }

  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

// GET /tasks/:id - return one task
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(task);
});

// Stage 2: Create new tasks
// POST /tasks - insert new task
app.post('/tasks', (req, res) => {
  const { title, done } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(
    title.trim(),
    done ? 1 : 0
  );
  
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTask);
});

// Stage 3: Update and delete
// PUT /tasks/:id - update task
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, done } = req.body;
  
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (title !== undefined && (title.trim() === '')) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }
  
  const updatedTitle = title !== undefined ? title.trim() : existing.title;
  const updatedDone = done !== undefined ? (done ? 1 : 0) : existing.done;
  
  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(
    updatedTitle,
    updatedDone,
    id
  );
  
  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(updatedTask);
});

// DELETE /tasks/:id - delete task
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
