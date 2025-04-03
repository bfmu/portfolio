pipeline {
    agent any
    environment {
        REGISTRY = 'reg.redflox.com'
        IMAGE_NAME = 'portfolio'
        TAG = "latest"
        REMOTE_USER = 'bryan'
        REMOTE_HOST = 'bfmu.dev'
        SSH_CREDENTIALS_ID = 'ssh-server-bfmudev'
        GITHUB_CONTEXT = 'jenkins/portfolio-deploy' // Contexto único para todas las notificaciones
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    githubNotify description: 'Iniciando checkout', 
                                 status: 'PENDING', 
                                 context: "${env.GITHUB_CONTEXT}/checkout"
                    
                    try {
                        git branch: 'main', credentialsId: 'github', url: 'https://github.com/bfmu/portfolio.git'
                        githubNotify description: 'Checkout completado', 
                                     status: 'SUCCESS', 
                                     context: "${env.GITHUB_CONTEXT}/checkout"
                    } catch (e) {
                        githubNotify description: "Checkout fallido: ${e.message}", 
                                     status: 'FAILURE', 
                                     context: "${env.GITHUB_CONTEXT}/checkout"
                        error("Checkout fallido")
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
                script {
                    githubNotify description: 'Construyendo aplicación', 
                                 status: 'PENDING', 
                                 context: "${env.GITHUB_CONTEXT}/build"
                    
                    try {
                        sh 'npm install'
                        sh 'npm run build'
                        stash includes: 'dist/**', name: 'build_artifacts'
                        githubNotify description: 'Build exitoso', 
                                     status: 'SUCCESS', 
                                     context: "${env.GITHUB_CONTEXT}/build"
                    } catch (e) {
                        githubNotify description: "Build fallido: ${e.message}", 
                                     status: 'FAILURE', 
                                     context: "${env.GITHUB_CONTEXT}/build"
                        error("Build fallido")
                    }
                }
            }
        }

        stage('Build and Publish Docker Image') {
            steps {
                script {
                    githubNotify description: 'Publicando imagen Docker', 
                                 status: 'PENDING', 
                                 context: "${env.GITHUB_CONTEXT}/docker"
                    
                    try {
                        unstash 'build_artifacts'
                        docker.withRegistry("https://${env.REGISTRY}", 'docker-registry-credentials') {
                            def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${TAG}")
                            image.push()
                        }
                        githubNotify description: 'Imagen publicada exitosamente', 
                                     status: 'SUCCESS', 
                                     context: "${env.GITHUB_CONTEXT}/docker"
                    } catch (e) {
                        githubNotify description: "Error al publicar imagen: ${e.message}", 
                                     status: 'FAILURE', 
                                     context: "${env.GITHUB_CONTEXT}/docker"
                        error("Error al publicar imagen Docker")
                    }
                }
            }
        }

        stage('Deploy to Remote Server') {
            steps {
                script {
                    githubNotify description: 'Iniciando despliegue', 
                                 status: 'PENDING', 
                                 context: "${env.GITHUB_CONTEXT}/deploy"
                    
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
                                cd /home/bryan/docker/github/portfolio || { echo '❌ Error: directorio no encontrado'; exit 1; }
                                docker compose down || echo '⚠️ Advertencia: docker compose down falló'
                                git pull || { echo '❌ Error: git pull falló'; exit 1; }

                                echo 'TAG=${TAG}' > .env
                                echo "$DOCKER_PASS" | docker login reg.redflox.com -u "$DOCKER_USER" --password-stdin || { echo '❌ Error: docker login falló'; exit 1; }
                                
                                docker compose pull || { echo '❌ Error: docker compose pull falló'; exit 1; }
                                docker compose up -d || { echo '❌ Error: docker compose up falló'; exit 1; }
                            """

                            sshCommand remote: remote, command: commands
                            githubNotify description: 'Despliegue completado', 
                                         status: 'SUCCESS', 
                                         context: "${env.GITHUB_CONTEXT}/deploy"
                        }
                    } catch (e) {
                        githubNotify description: "Despliegue fallido: ${e.message}", 
                                     status: 'FAILURE', 
                                     context: "${env.GITHUB_CONTEXT}/deploy"
                        error("Despliegue fallido")
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                def currentStatus = currentBuild.currentResult
                def message = (currentStatus == 'SUCCESS') ? 
                    'Pipeline completado exitosamente' : 
                    "Pipeline fallado (Estado: ${currentStatus})"
                
                githubNotify description: message,
                             status: currentStatus,
                             context: "${env.GITHUB_CONTEXT}/summary"
            }
        }
    }
}