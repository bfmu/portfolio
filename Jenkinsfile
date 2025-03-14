pipeline {
    agent {
        docker {
            image 'node:lts'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
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
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t mi-app:${BUILD_NUMBER} .'
            }
        }
        // stage('Push Docker Image') {
        //     steps {
        //         withDockerRegistry([credentialsId: 'docker-hub-cred']) {
        //             sh 'docker push mi-app:${BUILD_NUMBER}'
        //         }
        //     }
        // }
    }
}
