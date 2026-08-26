# BE-03: Task API with PostgreSQL in Docker

A RESTful CRUD API for managing tasks, using PostgreSQL in Docker for persistent data storage.

## Overview

This project demonstrates how to containerize a full stack application with Docker. The API runs against a real PostgreSQL database running in a Docker container, and the entire stack starts with a single command.

**Architecture:**
```
Client → API (Docker) → PostgreSQL (Docker)
```

## Why Docker + PostgreSQL?

- **Consistent environment** - Runs the same on every machine
- **No installation required** - PostgreSQL runs in a container
- **Persistent data** - Volume ensures data survives container restarts
- **Production-like** - Same stack used by real companies

## Quick Start

### Prerequisites
- Docker and Docker Compose installed

### One Command to Run Everything

```bash
# Clone the repository
git clone https://github.com/MehmetnC1/be02-task-api.git
cd be02-task-api

# Copy environment file
cp .env.example .env

# Start the stack
docker compose up
```

The API will be available at `http://localhost:3000`. On first run, it automatically:
1. Creates the PostgreSQL database
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
curl -i http://localhost:3000/tasks
```

**Get a specific task:**
```bash
curl -i http://localhost:3000/tasks/1
```

**Create a new task:**
```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Docker", "done": false}'
```

**Update a task:**
```bash
curl -i -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "done": true}'
```

**Delete a task:**
```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

## Database Structure

**Table: tasks**

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key (auto-increment) |
| title | TEXT | Task description |
| done | BOOLEAN | Completion status |

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgres://postgres:dev@localhost:5432/tasks |

## Persistence Test

Data persists across container restarts:

```bash
# Create some tasks
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title": "Test task"}'

# Restart the stack
docker compose down
docker compose up -d

# Data is still there
curl http://localhost:3000/tasks
```

## File Structure

```
be02-task-api/
├── server.js            # Main application file
├── package.json         # Dependencies and scripts
├── Dockerfile           # App container build
├── docker-compose.yml   # Stack orchestration
├── .env.example         # Environment template
├── .env                 # Environment secrets (git-ignored)
└── README.md            # This file
```

## Useful Docker Commands

```bash
# Start the stack
docker compose up -d

# Stop the stack
docker compose down

# View logs
docker compose logs -f

# Access PostgreSQL directly
docker exec -it be02-task-api-db-1 psql -U postgres -d tasks

# List tables
docker exec -it be02-task-api-db-1 psql -U postgres -d tasks -c "\dt"

# Query tasks
docker exec -it be02-task-api-db-1 psql -U postgres -d tasks -c "SELECT * FROM tasks;"
```

## Author

Backend AI Engineering - Week 3 Assignment (BE-03)
