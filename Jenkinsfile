pipeline {
    agent any
    stages {
        stage('SonarQube Quality Test') {
            agent {
                label 'docker-agent'
            }
            def sonarqubeScannerHome = tool name: 'sonarqube', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
            withCredentials([string(credentialsId: 'sonarqube', variable: 'sonarLogin')]) {
                sh "${sonarqubeScannerHome}/bin/sonar-scanner -e -Dsonar.host.url=http://sonarqube:9000 -Dsonar.login=${sonarLogin} -Dsonar.projectName=gs-gradle -Dsonar.projectVersion=${env.BUILD_NUMBER} -Dsonar.projectKey=GS -Dsonar.sources=complete/src/main/ -Dsonar.tests=complete/src/test/ -Dsonar.language=java -Dsonar.java.binaries=."
            }
        }
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

