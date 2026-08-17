pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        APP_NAME = 'task-management-system'
        BACKEND_HEALTH_URL = 'http://localhost:5000/api/health'
        BACKEND_HEALTH_URL_ALT = 'http://host.docker.internal:5000/api/health'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== STAGE 1: Checking out code from repository ==='
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '=== STAGE 2: Installing Backend and Frontend dependencies ==='
                dir('backend') {
                    sh 'rm -rf node_modules'
                    sh 'npm install'
                }

                dir('frontend') {
                    sh 'rm -rf node_modules'
                    sh 'npm install --include=optional'
                    sh 'npm install --no-save --package-lock=false @rollup/rollup-linux-x64-gnu@4.62.4 --force'
                }
            }
        }

        stage('Backend Tests') {
            steps {
                echo '=== STAGE 3: Executing Backend API & Unit Tests (Jest/Supertest) ==='
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                echo '=== STAGE 4: Building React (Vite) Production Assets ==='
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo '=== STAGE 5: Building Docker Images with Docker Compose ==='
                sh 'docker --version'
                sh 'docker compose version'
                sh 'docker compose config'
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                echo '=== STAGE 6: Deploying Application via Docker Compose ==='
                sh 'docker compose down'
                sh 'docker compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                echo '=== STAGE 7: Verifying Backend Endpoint Health ==='
                sleep 10
                script {
                    def maxRetries = 12
                    def retryCount = 0
                    def healthy = false

                    while (retryCount < maxRetries && !healthy) {
                        try {
                            def response = sh(
                                script: "docker exec task_backend_api wget -qO- http://localhost:5000/api/health || true",
                                returnStdout: true
                            ).trim()

                            if (response.contains('"status":"UP"')) {
                                echo "Health Check SUCCESS via backend container! Response: ${response}"
                                healthy = true
                            } else {
                                def httpStatus = sh(
                                    script: "curl -s -o /dev/null -w '%{http_code}' ${BACKEND_HEALTH_URL_ALT} || true",
                                    returnStdout: true
                                ).trim()

                                if (httpStatus == '200') {
                                    echo "Health Check SUCCESS via ${BACKEND_HEALTH_URL_ALT}! HTTP Status: 200"
                                    healthy = true
                                } else {
                                    echo "Health Check attempt ${retryCount + 1}/${maxRetries} returned response: ${response}. Retrying in 5s..."
                                    sleep 5
                                    retryCount++
                                }
                            }
                        } catch (Exception e) {
                            echo "Health Check attempt ${retryCount + 1}/${maxRetries} failed with error. Retrying in 5s..."
                            sleep 5
                            retryCount++
                        }
                    }

                    if (!healthy) {
                        error("Deployment verification failed: Backend Health Check did not return UP status.")
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline Execution Finished.'
        }
        success {
            echo '======================================================='
            echo 'SUCCESS: CI/CD Pipeline completed successfully!'
            echo 'Task Management System is deployed and healthy.'
            echo '======================================================='
        }
        failure {
            echo '======================================================='
            echo 'FAILURE: CI/CD Pipeline failed during execution.'
            echo 'Please inspect stage logs for details.'
            echo '======================================================='
        }
    }
}
