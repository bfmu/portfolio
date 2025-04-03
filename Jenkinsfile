pipeline {
    agent any
    environment {
        REGISTRY = 'reg.redflox.com'
        IMAGE_NAME = 'portfolio'
        TAG = "latest"
        REMOTE_USER = 'bryan'
        REMOTE_HOST = 'bfmu.dev'
        SSH_CREDENTIALS_ID = 'ssh-server-bfmudev'
        GITHUB_CONTEXT = 'Jenkins CI/CD - Portfolio'
    }
    stages {
        stage('Checkout Code') {
            steps {
                script {
                    try {
                        githubNotify credentialsId: 'github', 
                                    description: 'Iniciando checkout del código', 
                                    status: 'PENDING', 
                                    context: "${env.GITHUB_CONTEXT} - Checkout",
                                    targetUrl: "${env.BUILD_URL}"
                        
                        git branch: 'main', credentialsId: 'github', url: 'https://github.com/bfmu/portfolio.git'
                        
                        githubNotify credentialsId: 'github', 
                                    description: 'Checkout completado exitosamente', 
                                    status: 'SUCCESS', 
                                    context: "${env.GITHUB_CONTEXT} - Checkout",
                                    targetUrl: "${env.BUILD_URL}"
                    } catch (Exception e) {
                        githubNotify credentialsId: 'github', 
                                    description: "Falló el checkout: ${e.message}", 
                                    status: 'FAILURE', 
                                    context: "${env.GITHUB_CONTEXT} - Checkout",
                                    targetUrl: "${env.BUILD_URL}"
                        error "Pipeline failed during checkout: ${e.message}"
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
                    try {
                        githubNotify credentialsId: 'github', 
                                    description: 'Iniciando construcción del código', 
                                    status: 'PENDING', 
                                    context: "${env.GITHUB_CONTEXT} - Build",
                                    targetUrl: "${env.BUILD_URL}"
                        
                        sh 'npm install'
                        sh 'npm run build'
                        stash includes: 'dist/**', name: 'build_artifacts'
                        
                        githubNotify credentialsId: 'github', 
                                    description: 'Build completado exitosamente', 
                                    status: 'SUCCESS', 
                                    context: "${env.GITHUB_CONTEXT} - Build",
                                    targetUrl: "${env.BUILD_URL}"
                    } catch (Exception e) {
                        githubNotify credentialsId: 'github', 
                                    description: "Falló la construcción: ${e.message}", 
                                    status: 'FAILURE', 
                                    context: "${env.GITHUB_CONTEXT} - Build",
                                    targetUrl: "${env.BUILD_URL}"
                        error "Pipeline failed during build: ${e.message}"
                    }
                }
            }
        }
        
        stage('Build and Publish Docker Image') {
            agent any
            steps {
                script {
                    try {
                        githubNotify credentialsId: 'github', 
                                    description: 'Iniciando construcción de imagen Docker', 
                                    status: 'PENDING', 
                                    context: "${env.GITHUB_CONTEXT} - Docker Build",
                                    targetUrl: "${env.BUILD_URL}"
                        
                        unstash 'build_artifacts'
                        docker.withRegistry("https://${env.REGISTRY}", 'docker-registry-credentials') {
                            def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${TAG}")
                            image.push()
                        }
                        
                        githubNotify credentialsId: 'github', 
                                    description: 'Imagen Docker publicada exitosamente', 
                                    status: 'SUCCESS', 
                                    context: "${env.GITHUB_CONTEXT} - Docker Build",
                                    targetUrl: "${env.BUILD_URL}"
                    } catch (Exception e) {
                        githubNotify credentialsId: 'github', 
                                    description: "Falló la construcción/publicación Docker: ${e.message}", 
                                    status: 'FAILURE', 
                                    context: "${env.GITHUB_CONTEXT} - Docker Build",
                                    targetUrl: "${env.BUILD_URL}"
                        error "Pipeline failed during Docker build/push: ${e.message}"
                    }
                }
            }
        }
        
        stage('Deploy to Remote Server') {
            steps {
                script {
                    try {
                        githubNotify credentialsId: 'github', 
                                    description: 'Iniciando despliegue en servidor remoto', 
                                    status: 'PENDING', 
                                    context: "${env.GITHUB_CONTEXT} - Deploy",
                                    targetUrl: "${env.BUILD_URL}"
                        
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
                        }
                        
                        githubNotify credentialsId: 'github', 
                                    description: 'Despliegue completado exitosamente', 
                                    status: 'SUCCESS', 
                                    context: "${env.GITHUB_CONTEXT} - Deploy",
                                    targetUrl: "${env.BUILD_URL}"
                    } catch (Exception e) {
                        githubNotify credentialsId: 'github', 
                                    description: "Falló el despliegue: ${e.message}", 
                                    status: 'FAILURE', 
                                    context: "${env.GITHUB_CONTEXT} - Deploy",
                                    targetUrl: "${env.BUILD_URL}"
                        error "Pipeline failed during deployment: ${e.message}"
                    }
                }
            }
        }
    }
    
    post {
        success {
            githubNotify credentialsId: 'github', 
                        description: 'Pipeline completado exitosamente', 
                        status: 'SUCCESS', 
                        context: "${env.GITHUB_CONTEXT}",
                        targetUrl: "${env.BUILD_URL}"
        }
        failure {
            githubNotify credentialsId: 'github', 
                        description: 'Pipeline falló', 
                        status: 'FAILURE', 
                        context: "${env.GITHUB_CONTEXT}",
                        targetUrl: "${env.BUILD_URL}"
        }
        aborted {
            githubNotify credentialsId: 'github', 
                        description: 'Pipeline abortado', 
                        status: 'ERROR', 
                        context: "${env.GITHUB_CONTEXT}",
                        targetUrl: "${env.BUILD_URL}"
        }
    }
}