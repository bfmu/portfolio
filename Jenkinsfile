pipeline {
    agent {
        docker {
            image 'node:lts'
        }
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', credentialsId: 'github', url: 'https://github.com/bfmu/portfolio.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Save Build Artifacts') {
            steps {
                stash includes: '**', name: 'build_artifacts'
            }
        }
    }
}

pipeline {
    agent any  // Ahora ejecutamos en el host que tiene Docker
    stages {
        stage('Retrieve Build Artifacts') {
            steps {
                unstash 'build_artifacts'
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t mi-app:${BUILD_NUMBER} .'
            }
        }
    }
}
