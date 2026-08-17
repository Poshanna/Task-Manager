pipeline {
    agent any
    tools {
    nodejs 'NodeJS-20'
}

    environment {
        APP_NAME = 'task-management-system'
        BACKEND_HEALTH_URL = 'http://localhost:5000/api/health'
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
                sleep 5
                script {
                    def maxRetries = 10
                    def retryCount = 0
                    def healthy = false

                    while (retryCount < maxRetries && !healthy) {
                        try {
                            def response = sh(
                                script: "curl -s -o /dev/null -w '%{http_code}' ${BACKEND_HEALTH_URL}",
                                returnStdout: true
                            ).trim()

                            if (response == '200') {
                                echo "Health Check SUCCESS! HTTP Status: ${response}"
                                healthy = true
                            } else {
                                echo "Health Check attempt ${retryCount + 1}/${maxRetries} returned status: ${response}. Retrying in 3s..."
                                sleep 3
                                retryCount++
                            }
                        } catch (Exception e) {
                            echo "Health Check attempt ${retryCount + 1}/${maxRetries} failed with error. Retrying in 3s..."
                            sleep 3
                            retryCount++
                        }
                    }

                    if (!healthy) {
                        error("Deployment verification failed: Backend Health Check at ${BACKEND_HEALTH_URL} did not return 200 OK.")
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
