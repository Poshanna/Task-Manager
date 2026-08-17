-- Task Management System Database Schema Initialization

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    due_date DATE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Sample Seed Data (Password for demo user is 'Password123!')
-- Bcrypt hash for 'Password123!' with salt round 10
INSERT INTO users (id, name, email, password, created_at)
VALUES (
    1,
    'Demo Student',
    'student@devops.edu',
    '$2a$10$wNqg8S9T12P4WqZgE0Z9u.oX8w.mB0vP4S9T12P4WqZgE0Z9u.oX8',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Reset user sequence if needed
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

INSERT INTO tasks (title, description, status, priority, due_date, user_id)
VALUES 
    ('Setup Jenkins Pipeline', 'Configure Jenkins Declarative Pipeline stages for automated CI/CD', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '2 days', 1),
    ('Dockerize Task App', 'Create multi-stage Dockerfiles and docker-compose.yml configuration', 'COMPLETED', 'HIGH', CURRENT_DATE + INTERVAL '1 day', 1),
    ('Write Backend API Unit Tests', 'Cover auth, task CRUD, and health endpoints using Jest and Supertest', 'TODO', 'MEDIUM', CURRENT_DATE + INTERVAL '5 days', 1)
ON CONFLICT DO NOTHING;
