# BE-02: Task API with SQLite Database

A RESTful CRUD API for managing tasks, using SQLite for persistent data storage.

## Overview

This project demonstrates how to connect a CRUD API to a real database. Instead of storing tasks in memory (which disappear on restart), data is now persisted in a SQLite database file.

**Architecture:**
```
Client → API → SQLite Database (tasks.db)
```

## Why SQLite?

- **No installation required** - SQLite is embedded in the application
- **Single file storage** - All data stored in `tasks.db`
- **Lightweight** - Perfect for development and small applications
- **Persistent** - Data survives server restarts

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/MehmetnC1/be02-task-api.git
cd be02-task-api

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3000`. On first run, it automatically:
1. Creates the `tasks.db` database file
2. Creates the `tasks` table
3. Inserts 3 example tasks

## API Endpoints

| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| GET | /tasks | Get all tasks | 200 |
| GET | /tasks/:id | Get a single task | 200 / 404 |
| POST | /tasks | Create a new task | 201 / 400 |
| PUT | /tasks/:id | Update a task | 200 / 404 |
| DELETE | /tasks/:id | Delete a task | 204 / 404 |

### Examples

**Get all tasks:**
```bash
curl http://localhost:3000/tasks
```

**Get a specific task:**
```bash
curl http://localhost:3000/tasks/1
```

**Create a new task:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn SQL", "done": false}'
```

**Update a task:**
```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "done": true}'
```

**Delete a task:**
```bash
curl -X DELETE http://localhost:3000/tasks/1
```

## Database Structure

**Table: tasks**

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| title | TEXT | Task description |
| done | BOOLEAN | Completion status (0 or 1) |

## Testing with SQLite Viewer

You can use [DB Browser for SQLite](https://sqlitebrowser.org/) to view and modify the database directly.

### Useful SQL Queries

```sql
-- List every task
SELECT * FROM tasks;

-- Show only completed tasks
SELECT * FROM tasks WHERE done = 1;

-- Count all tasks
SELECT COUNT(*) FROM tasks;

-- Mark every task as completed
UPDATE tasks SET done = 1;

-- Delete all completed tasks
DELETE FROM tasks WHERE done = 1;
```

## Optional Features Implemented

- **Search**: `GET /tasks?search=milk` - Uses SQL LIKE operator
- **Filter**: `GET /tasks?done=true` - Filter by completion status
- **Sort**: `GET /tasks?sort=title` - Sort alphabetically by title

## File Structure

```
be02-task-api/
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
├── tasks.db           # SQLite database (auto-created)
└── README.md          # This file
```

## Author

Backend AI Engineering - Week 3 Assignment (BE-02)
