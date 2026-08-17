# Full-Stack Task Management System with Jenkins CI/CD 🚀

A production-ready DevOps assignment project featuring a **Task Management System** built with **React (Vite)**, **Node.js (Express)**, **PostgreSQL**, containerized using **Docker** and **Docker Compose**, and automated using a **Jenkins Declarative Pipeline (`Jenkinsfile`)**.

---

## 🏗️ CI/CD Architecture & Flow

```text
    Developer
        ↓
    GitHub
        ↓
    Jenkins
        ↓
    Checkout
        ↓
    Install Dependencies
        ↓
    Automated Tests (Jest / Supertest)
        ↓
    Frontend Build (Vite Production)
        ↓
    Docker Build (Docker Compose)
        ↓
    Docker Compose Deploy
        ↓
    Health Check (GET /api/health)
        ↓
    Running Task Management System
```

---

## 🛠️ Project Overview & Technology Stack

### 1. Application Layer
- **Frontend**: React.js (Vite), React Router v6, Axios, Lucide Icons, Modern Dark Glassmorphism CSS.
- **Backend**: Node.js, Express.js REST API with JWT authentication (`jsonwebtoken`), password hashing (`bcryptjs`).
- **Database**: PostgreSQL 16 with schema initialization, indexes, and sample seed data (`database/init.sql`).
- **Testing**: Jest & Supertest API unit testing suite.

### 2. DevOps & Infrastructure Layer
- **Containerization**: Multi-stage Dockerfiles (`frontend/Dockerfile`, `backend/Dockerfile`) orchestrated via `docker-compose.yml`.
- **Jenkins CI/CD**: Custom Dockerized Jenkins runner (`jenkins-docker/Dockerfile`) equipped with Docker CLI, Docker Compose plugin, and Docker socket access.
- **Pipeline Automation**: 7-stage Declarative `Jenkinsfile`.

---

## 📋 Jenkins CI/CD Pipeline Stages

The `Jenkinsfile` automates the complete continuous integration and deployment flow across 7 distinct stages:

1. **Checkout**: Retrieves source code from the GitHub repository (`https://github.com/Poshanna/Task-Manager`).
2. **Install Dependencies**: Executes `npm install` for backend and frontend (includes `--include=optional` and Rollup Linux workaround for Vite).
3. **Backend Tests**: Executes Jest & Supertest unit tests (`npm test`). The pipeline fails if any test fails.
4. **Frontend Build**: Compiles React application into static production assets (`npm run build`).
5. **Docker Build**: Executes `docker compose build` using Docker CLI and Compose plugin.
6. **Deploy**: Redeploys application containers safely via `docker compose down` followed by `docker compose up -d`.
7. **Health Check**: Polls `http://localhost:5000/api/health` with automated retries until HTTP status 200 OK is confirmed.

---

## 🐳 Custom Jenkins CI Environment Setup (`jenkins-docker/`)

To support running Docker and Docker Compose commands inside Jenkins without missing binaries, a custom Jenkins image is defined in `jenkins-docker/Dockerfile`:

```dockerfile
FROM jenkins/jenkins:lts

USER root

RUN apt-get update \
    && apt-get install -y ca-certificates curl gnupg \
    && install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
    && chmod a+r /etc/apt/keyrings/docker.asc \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y docker-ce-cli docker-compose-plugin \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 999 docker || true \
    && usermod -aG docker jenkins

USER jenkins
```

### Build & Launch Custom Jenkins Container (Preserving `jenkins_home` Data)
```bash
# 1. Build custom Jenkins image
docker build -t jenkins-docker:latest ./jenkins-docker

# 2. Stop and remove existing container (volume jenkins_home is PRESERVED)
docker stop jenkins
docker rm jenkins

# 3. Run new Jenkins container with Docker socket mount
docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v //var/run/docker.sock:/var/run/docker.sock \
  --group-add 0 \
  jenkins-docker:latest
```

---

## ⚙️ How to Configure & Run the Jenkins Pipeline

1. Access Jenkins Dashboard at **`http://localhost:8080`**.
2. Install **NodeJS Plugin** under **Manage Jenkins** ➔ **Plugins**.
3. Configure **NodeJS-20** under **Manage Jenkins** ➔ **Tools** ➔ **NodeJS installations** (Name: `NodeJS-20`).
4. Click **New Item** ➔ Name: `Task-Manager-Pipeline` ➔ Select **Pipeline**.
5. Scroll to **Pipeline Section**:
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/Poshanna/Task-Manager.git`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`
6. Click **Save** and **Build Now**.

---

## 🚀 How to Run the Project Locally

### Option A: Docker Compose (Full Stack)
```bash
docker compose up -d --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **Backend Health Check**: `http://localhost:5000/api/health`

### Option B: Local Standalone Development
```bash
# Backend (Port 5000)
cd backend
npm install
npm run dev

# Frontend (Port 3000)
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing Instructions

```bash
cd backend
npm test
```
- Total test suites: 3 passed
- Total tests: 8 passed
