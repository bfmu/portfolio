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
                    // Recupera las credenciales SSH y las del Docker Registry
                    withCredentials([
                        usernamePassword(credentialsId: env.SSH_CREDENTIALS_ID, passwordVariable: 'REMOTE_PASSWORD', usernameVariable: 'REMOTE_USER'),
                        usernamePassword(credentialsId: 'docker-registry-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')
                    ]) {
                        def remote = [:]
                        remote.name = 'Remote Server'
                        remote.host = env.REMOTE_HOST
                        remote.user = REMOTE_USER
                        remote.password = REMOTE_PASSWORD
                        remote.allowAnyHosts = true

                        // Comandos a ejecutar en el servidor remoto
                        def commands = """
                            set -x
                            cd /home/bryan/docker/github/portfolio || { echo '❌ Error: no se pudo entrar al directorio'; exit 1; }

                            echo 'TAG=${TAG}' > .env
                            echo '[DEBUG] .env content:' && cat .env

                            echo '🔐 Login al registry'
                            echo "$DOCKER_PASS" | docker login reg.redflox.com -u "$DOCKER_USER" --password-stdin || { echo '❌ docker login falló'; exit 1; }

                            docker compose down || echo '⚠️ docker compose down falló'
                            docker compose pull || echo '❌ docker compose pull falló'
                            docker compose up -d || echo '❌ docker compose up falló'

                            echo '✅ Despliegue finalizado'
                            exit 0
                        """

                        // Ejecuta los comandos en el servidor remoto
                        sshCommand remote: remote, command: commands
                    }
                }
            }
        }
    }
}
