pipeline {
    agent any
    environment {
        REGISTRY = 'reg.redflox.com'
        IMAGE_NAME = 'portfolio'
        TAG = "latest"
        REMOTE_USER = 'bryan'
        REMOTE_HOST = 'bfmu.dev'
        SSH_CREDENTIALS_ID = 'ssh-server-bfmudev'
    }
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
                    // Recupera las credenciales almacenadas en Jenkins
                    withCredentials([usernamePassword(credentialsId: env.SSH_CREDENTIALS_ID, passwordVariable: 'REMOTE_PASSWORD', usernameVariable: 'REMOTE_USER')]) {
                        def remote = [:]
                        remote.name = 'Remote Server'
                        remote.host = env.REMOTE_HOST
                        remote.user = REMOTE_USER
                        remote.password = REMOTE_PASSWORD
                        remote.allowAnyHosts = true
                        
                        // Define el contenido del archivo .env
                        def envContent = "TAG=${TAG}\n"
                        
                        // Comandos a ejecutar en el servidor remoto
                        def commands = """
                            cd /home/bryan/docker/github/portfolio
                            docker compose down
                            docker compose pull
                            docker compose up -d
                        """
                        
                        // Ejecuta los comandos en el servidor remoto
                        sshCommand remote: remote, command: commands
                    }
                }
            }
        }
    }
}
