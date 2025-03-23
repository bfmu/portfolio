pipeline {
    agent any
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', credentialsId: 'github', url: 'https://github.com/bfmu/portfolio.git'
            }
        }
        stage('Build Code') {
            agent {
                docker {
                    image 'node:lts'
                    args '-v /var/run/docker.sock:/var/run/docker.sock' // Permite que Docker acceda al daemon
                }
            }
            steps {
                sh 'npm install'
                sh 'npm run build'
                stash includes: 'dist/**', name: 'build_artifacts'
            }
        }
        stage('Build and Publish Docker Image') {
            agent any
            environment {
                REGISTRY = 'reg.redflox.com' // O la IP si es remoto
                IMAGE_NAME = 'portfolio'
                TAG = "${env.BUILD_NUMBER}"
            }
            steps {
                unstash 'build_artifacts'
                script {
                    docker.withRegistry("https://${env.REGISTRY}", 'docker-registry-credentials') {
                        def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${TAG}")
                        image.push()
                    }
                }
            }
        }
    }
}
