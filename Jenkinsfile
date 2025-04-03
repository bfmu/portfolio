pipeline {
    agent any
    environment {
        REGISTRY = 'reg.redflox.com'
        IMAGE_NAME = 'portfolio'
        TAG = "latest"
        REMOTE_USER = 'bryan'
        REMOTE_HOST = 'bfmu.dev'
        SSH_CREDENTIALS_ID = 'ssh-server-bfmudev'
        GITHUB_CONTEXT_PREFIX = 'jenkins/portfolio' // Prefijo para todos los contextos
    }
    
    stages {
        stage('Initialize') {
            steps {
                script {
                    // Declaración correcta de la variable con 'def' dentro del bloque script
                    def COMMIT_SHA = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    env.COMMIT_SHA = COMMIT_SHA // Almacenar en environment para uso posterior si es necesario
                    
                    githubNotify description: 'Pipeline iniciado', 
                                 status: 'PENDING', 
                                 context: "${env.GITHUB_CONTEXT_PREFIX}/pipeline"
                }
            }
        }
        
        stage('Checkout Code') {
            steps {
                githubNotify description: 'Obteniendo código fuente', 
                             status: 'PENDING', 
                             context: "${env.GITHUB_CONTEXT_PREFIX}/checkout"
                script {
                    try {
                        git branch: 'main', credentialsId: 'github', url: 'https://github.com/bfmu/portfolio.git'
                        githubNotify description: 'Código obtenido exitosamente', 
                                     status: 'SUCCESS', 
                                     context: "${env.GITHUB_CONTEXT_PREFIX}/checkout"
                    } catch (e) {
                        githubNotify description: "Error en checkout: ${e.message}", 
                                     status: 'FAILURE', 
                                     context: "${env.GITHUB_CONTEXT_PREFIX}/checkout"
                        error("Checkout fallido: ${e.message}")
                    }
                }
            }
        }
        
        stage('Build Code') {
            agent {
                docker {
                    image 'node:lts'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                githubNotify description: 'Construyendo aplicación', 
                             status: 'PENDING', 
                             context: "${env.GITHUB_CONTEXT_PREFIX}/build"
                script {
                    try {
                        sh 'npm install'
                        sh 'npm run build'
                        stash includes: 'dist/**', name: 'build_artifacts'
                        githubNotify description: 'Build exitoso', 
                                     status: 'SUCCESS', 
                                     context: "${env.GITHUB_CONTEXT_PREFIX}/build"
                    } catch (e) {
                        githubNotify description: "Build fallido: ${e.message}", 
                                     status: 'FAILURE', 
                                     context: "${env.GITHUB_CONTEXT_PREFIX}/build"
                        error("Build fallido: ${e.message}")
                    }
                }
            }
        }
        
        stage('Build and Publish Docker Image') {
            agent any
            steps {
                githubNotify description: 'Publicando imagen Docker', 
                             status: 'PENDING', 
                             context: "${env.GITHUB_CONTEXT_PREFIX}/docker-push"
                script {
                    try {
                        unstash 'build_artifacts'
                        docker.withRegistry("https://${env.REGISTRY}", 'docker-registry-credentials') {
                            def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${TAG}")
                            image.push()
                        }
                        githubNotify description: "Imagen ${IMAGE_NAME}:${TAG} publicada", 
                                     status: 'SUCCESS', 
                                     context: "${env.GITHUB_CONTEXT_PREFIX}/docker-push"
                    } catch (e) {
                        githubNotify description: "Error al publicar imagen: ${e.message}", 
                                     status: 'FAILURE', 
                                     context: "${env.GITHUB_CONTEXT_PREFIX}/docker-push"
                        error("Error al publicar imagen Docker: ${e.message}")
                    }
                }
            }
        }
        
        stage('Deploy to Remote Server') {
            steps {
                githubNotify description: 'Desplegando en servidor remoto', 
                             status: 'PENDING', 
                             context: "${env.GITHUB_CONTEXT_PREFIX}/deploy"
                script {
                    try {
                        withCredentials([
                            usernamePassword(credentialsId: env.SSH_CREDENTIALS_ID, 
                                          passwordVariable: 'REMOTE_PASSWORD', 
                                          usernameVariable: 'REMOTE_USER'),
                            usernamePassword(credentialsId: 'docker-registry-credentials', 
                                          passwordVariable: 'DOCKER_PASS', 
                                          usernameVariable: 'DOCKER_USER')
                        ]) {
                            def remote = [:]
                            remote.name = 'Remote Server'
                            remote.host = env.REMOTE_HOST
                            remote.user = REMOTE_USER
                            remote.password = REMOTE_PASSWORD
                            remote.allowAnyHosts = true

                            def commands = """
                                set -x
                                cd /home/bryan/docker/github/portfolio || { echo '❌ Error: no se pudo entrar al directorio'; exit 1; }
                                docker compose down || echo '⚠️ docker compose down falló'
                                git pull || echo '❌ git pull falló.'

                                echo 'TAG=${TAG}' > .env
                                echo '[DEBUG] .env content:' && cat .env

                                echo '🔐 Login al registry'
                                echo "$DOCKER_PASS" | docker login reg.redflox.com -u "$DOCKER_USER" --password-stdin || { echo '❌ docker login falló'; exit 1; }
                                
                                docker compose pull || echo '❌ docker compose pull falló'
                                docker compose up -d || echo '❌ docker compose up falló'

                                echo '✅ Despliegue finalizado'
                                exit 0
                            """

                            sshCommand remote: remote, command: commands
                            
                            githubNotify description: 'Despliegue completado exitosamente', 
                                         status: 'SUCCESS', 
                                         context: "${env.GITHUB_CONTEXT_PREFIX}/deploy"
                        }
                    } catch (e) {
                        githubNotify description: "Error en despliegue: ${e.message}", 
                                     status: 'FAILURE', 
                                     context: "${env.GITHUB_CONTEXT_PREFIX}/deploy"
                        error("Despliegue fallido: ${e.message}")
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                def currentStatus = currentBuild.currentResult
                def message = currentStatus == 'SUCCESS' ? 
                    'Pipeline completado exitosamente' : 
                    "Pipeline fallado - Estado: ${currentStatus}"
                
                githubNotify description: message,
                             status: currentStatus,
                             context: "${env.GITHUB_CONTEXT_PREFIX}/pipeline"
            }
        }
    }
}