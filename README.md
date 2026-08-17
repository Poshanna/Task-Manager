# Task Management System with Jenkins CI/CD 🚀

A full-stack DevOps demonstration project featuring a **Task Management System** powered by **React (Vite)**, **Node.js (Express)**, **PostgreSQL**, and containerized using **Docker** and **Docker Compose**. 

The core highlight of this project is a fully configured **Jenkins Declarative CI/CD Pipeline** (`Jenkinsfile`) that automates code checkout, dependency installation, backend unit testing, frontend compilation, Docker image containerization, deployment, and endpoint health checks.

---

## 📋 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Features](#-project-features)
- [Directory Structure](#-directory-structure)
- [Local Development Setup](#-local-development-setup)
- [Docker Compose Instructions](#-docker-compose-instructions)
- [Jenkins CI/CD Pipeline Overview](#-jenkins-cicd-pipeline-overview)
- [Jenkins Setup & Configuration Guide](#-jenkins-setup--configuration-guide)
- [GitHub Webhook Integration](#-github-webhook-integration)
- [Testing Instructions](#-testing-instructions)
- [Demonstration Workflow](#-demonstration-workflow)
- [Recommended Screenshots for DevOps Assignment](#-recommended-screenshots-for-devops-assignment)

---

## 🏗️ Architecture & Tech Stack

```text
[ Developer Push ] ──► [ GitHub Repository ] ──► [ Jenkins CI/CD Pipeline ]
                                                            │
    ┌───────────────────────────────────────────────────────┴────────────────────────────────────────┐
    ▼                       ▼                        ▼                       ▼                       ▼
Stage 1: Checkout     Stage 2: Install    Stage 3: Backend Tests   Stage 4: Frontend Build  Stage 5: Docker Build
                                                                                                     │
    ┌────────────────────────────────────────────────────────────────────────────────────────────────┘
    ▼                                       ▼
Stage 6: Deploy (Docker Compose)    Stage 7: Health Check (http://localhost:5000/api/health)
```

### Technology Stack
- **Frontend**: React.js (Vite), React Router v6, Axios, Lucide Icons, Custom CSS3 Design System
- **Backend**: Node.js, Express.js REST API
- **Database**: PostgreSQL 16
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Testing**: Jest & Supertest
- **DevOps & Infrastructure**: Git, GitHub, Docker, Docker Compose, Jenkins Declarative Pipeline

---

## ✨ Project Features

### User Authentication
- User Registration with hashed passwords
- Secure JWT-based Login
- Protected Frontend Routes & Profile View
- Isolated per-user task state

### Task Management (CRUD & Filtering)
- Create, View, Edit, and Delete tasks
- Real-time task filtering by **Status** (`TODO`, `IN_PROGRESS`, `COMPLETED`)
- Filtering by **Priority** (`LOW`, `MEDIUM`, `HIGH`)
- Text Search by task title and description
- Due Date picker & status transition management

### Interactive Dashboard
- Real-time counters: Total Tasks, Pending, In-Progress, Completed, High Priority
- Quick task creation modal
- Recent task activity list

---

## 📂 Directory Structure

```text
Task manager/
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, ProtectedRoute, TaskModal
│   │   ├── pages/            # Login, Register, Dashboard, Tasks, Profile
│   │   ├── services/         # api.js (Axios API client)
│   │   ├── context/          # AuthContext.jsx (JWT state management)
│   │   ├── App.jsx           # Main Router
│   │   ├── index.css         # Styling design tokens & UI classes
│   │   └── main.jsx          # React DOM entry
│   ├── nginx.conf            # Nginx SPA serving configuration
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile            # Multi-stage React/Nginx Dockerfile
├── backend/
│   ├── config/               # db.js (PostgreSQL pool configuration)
│   ├── controllers/          # authController.js, taskController.js
│   ├── middleware/           # authMiddleware.js, errorHandler.js
│   ├── routes/               # authRoutes.js, taskRoutes.js, healthRoutes.js
│   ├── tests/                # health.test.js, auth.test.js, task.test.js
│   ├── app.js                # Express App definition
│   ├── server.js             # HTTP listener entry point
│   ├── package.json
│   └── Dockerfile            # Node.js backend Dockerfile
├── database/
│   └── init.sql              # PostgreSQL schemas, indexes & seed data
├── docker-compose.yml        # Orchestration (db, backend, frontend)
├── Jenkinsfile               # Jenkins Declarative Pipeline (7 stages)
├── .env.example              # Environment variables template
├── .gitignore
└── README.md
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18 or v20)
- PostgreSQL installed and running locally
- Git

### 2. Environment Variables
Copy `.env.example` to create a local `.env` file in the root directory:
```bash
cp .env.example .env
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend API server will run at `http://localhost:5000`.

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server will launch at `http://localhost:3000`.

---

## 🐳 Docker Compose Instructions

To build and launch the full multi-container stack (Database + Backend + Frontend):

### Start Containers
```bash
docker compose up -d --build
```

### Verify Container Status
```bash
docker compose ps
```
- Frontend will be accessible at: `http://localhost:3000`
- Backend REST API will be accessible at: `http://localhost:5000/api`
- Health check URL: `http://localhost:5000/api/health`

### Stop Containers
```bash
docker compose down
```

---

## 🔄 Jenkins CI/CD Pipeline Overview

The `Jenkinsfile` defines a 7-stage Declarative Pipeline:

1. **Checkout**: Pulls latest code from the GitHub repository.
2. **Install Dependencies**: Runs `npm install` in both `backend` and `frontend` directories.
3. **Backend Tests**: Executes Jest & Supertest API tests (`npm test`). Pipeline fails if tests do not pass.
4. **Frontend Build**: Compiles React assets using Vite (`npm run build`).
5. **Docker Build**: Builds Docker container images for frontend and backend (`docker compose build`).
6. **Deploy**: Deploys/restarts application containers via `docker compose up -d`.
7. **Health Check**: Queries `http://localhost:5000/api/health` with retry loops to verify successful deployment.

---

## 🛠️ Jenkins Setup & Configuration Guide

Follow these steps to configure Jenkins for your assignment demonstration:

### Step 1: Install & Launch Jenkins
1. Download Jenkins LTS for your operating system or run Jenkins via Docker:
   ```bash
   docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
   ```
2. Access `http://localhost:8080` in your web browser.
3. Retrieve initial admin password and complete initial wizard.

### Step 2: Install Required Plugins
Navigate to **Manage Jenkins** -> **Plugins** -> **Available Plugins** and install:
- **Git Plugin**
- **Pipeline**
- **Docker Pipeline**
- **NodeJS Plugin** (Optional, for Node environment tools)

### Step 3: Configure Docker & Host Permissions
Ensure the Jenkins user has permission to execute Docker commands on the host:
```bash
sudo usermod -aG docker jenkins
```

### Step 4: Create Jenkins Pipeline Job
1. On the Jenkins Dashboard, click **New Item**.
2. Enter Job Name: `Task-Manager-Pipeline`.
3. Select **Pipeline** project type and click **OK**.

### Step 5: Connect GitHub Repository
1. In the job configuration screen, scroll down to the **Pipeline** section.
2. Change **Definition** to `Pipeline script from SCM`.
3. Select **SCM**: `Git`.
4. Enter **Repository URL**: `https://github.com/<your-username>/<your-repo-name>.git`.
5. Set **Branch Specifier**: `*/main` (or `*/master`).
6. Confirm **Script Path**: `Jenkinsfile`.
7. Click **Save**.

### Step 6: Trigger & Execute Pipeline
1. Click **Build Now** on the left menu.
2. Watch each stage execute in the **Stage View**.
3. Verify that all 7 stages turn green (Success).

---

## 🔗 GitHub Webhook Integration

To automate pipeline execution whenever a developer pushes new code:

1. Open your GitHub Repository in a web browser.
2. Go to **Settings** -> **Webhooks** -> **Add webhook**.
3. Set **Payload URL**: `http://<your-jenkins-host>:8080/github-webhook/`.
4. Set **Content type**: `application/json`.
5. Under triggers, select **Just the push event**.
6. Click **Add webhook**.
7. In Jenkins Pipeline job configuration, check **GitHub hook trigger for Gitorious SCM polling**.

---

## 🧪 Testing Instructions

Run backend unit and integration tests manually using:

```bash
cd backend
npm test
```

### Intentional Test Failure Demo (DevOps Demonstration)
To demonstrate that Jenkins properly fails when a test breaks:
1. Open `backend/tests/health.test.js`.
2. Change line `expect(res.statusCode).toEqual(200);` to `expect(res.statusCode).toEqual(500);`.
3. Commit and push the code:
   ```bash
   git commit -am "test: intentional failure demo"
   git push
   ```
4. Observe Jenkins stage **Backend Tests** turn RED (Failed) and stop deployment.

---

## 🧪 Demonstration Workflow

```text
1. Developer edits application code locally.
2. Developer commits and pushes code to GitHub:
   git add .
   git commit -m "feat: updated task dashboard"
   git push origin main
3. GitHub triggers Jenkins pipeline automatically via Webhook.
4. Jenkins executes all 7 pipeline stages:
   [Checkout] -> [Install Dependencies] -> [Backend Tests] -> [Frontend Build] -> [Docker Build] -> [Deploy] -> [Health Check]
5. Application successfully redeployed and verified at http://localhost:3000!
```

---

## 📷 Recommended Screenshots for DevOps Assignment

When submitting your assignment report, capture the following screenshots:

1. **GitHub Repository**: Showing root files (`Jenkinsfile`, `docker-compose.yml`, `backend/`, `frontend/`).
2. **Jenkins Stage View**: Showing green status for all 7 stages (Checkout to Health Check).
3. **Jenkins Console Output**: Showing `SUCCESS: CI/CD Pipeline completed successfully!`.
4. **Docker Container Status**: Output of `docker compose ps` showing running `task_postgres_db`, `task_backend_api`, and `task_frontend_web`.
5. **Backend Health Check**: Web browser or Postman response from `http://localhost:5000/api/health`.
6. **Task Management UI - Dashboard**: Showing statistics counters and recent task cards.
7. **Task Management UI - Tasks Filter & Search**: Showing status/priority filters in action.
8. **Pipeline Failure Screen**: Jenkins Stage View showing red failure at "Backend Tests" when tests are intentionally broken.
