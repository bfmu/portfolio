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
        stage('Deploy to Remote Server') {
            steps {
                script {
                    def remote = [:]
                    remote.name = 'Remote Server'
                    remote.host = env.REMOTE_HOST
                    remote.user = 'usuario_remoto' // Reemplaza con el nombre de usuario del servidor remoto
                    remote.password = 'contraseña_remota' // Reemplaza con la contraseña del usuario remoto
                    remote.allowAnyHosts = true
                    
                    sshCommand remote: remote, command: """
                        docker login ${env.REGISTRY} -u <usuario> -p <contraseña>
                        docker pull ${env.REGISTRY}/${IMAGE_NAME}:${TAG}
                        docker stop ${IMAGE_NAME} || true
                        docker rm ${IMAGE_NAME} || true
                        docker run -d --name ${IMAGE_NAME} -p 80:80 ${REGISTRY}/${IMAGE_NAME}:${TAG}
                    """
                }
            }
        }
    }
}
