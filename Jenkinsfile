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
            steps {
                unstash 'build_artifacts'
                sh 'docker build -t mi-app:${BUILD_NUMBER} .'
            }
        }
    }
}
