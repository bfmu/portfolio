pipeline {
    agent {
        label 'docker-agent'
    }
    stages {
        stage('Build Code') {
            agent{
                docker {
                    image 'node:lts'
                }
            }
            steps {
                git branch: 'main', credentialsId: 'github', url: 'https://github.com/bfmu/portfolio.git'
                sh 'npm install'
                sh 'npm run build'
                stash includes: '**', name: 'build_artifacts'
            }
        }
        stage('Build and publish docker image') {
            agent {
                label 'docker-agent'
            }
            steps {
                unstash 'build_artifacts'
                sh 'docker build -t mi-app:${BUILD_NUMBER} .'
            }
        }
    }
}

