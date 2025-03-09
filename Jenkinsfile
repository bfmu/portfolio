pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "${env.DOCKER_USER}/mi_portfolio:${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = ${env.DOCKER_USER}
        DEPLOY_SERVER = ${env.DEPLOY_SERVER}
        APP_CONTAINER_NAME = ${env.APP_CONTAINER_NAME}
        APP_PORT = ${env.APP_CONTAINER_NAME}
    }

    stages {
        stage('Clonar Repositorio') {
            agent {
                docker { image 'alpine/git' } 
            }
            steps {
                sh "git clone --branch main https://github.com/bfmu/portfolio.git ."
            }
        }

        stage('Análisis con SonarQube') {
            agent {
                docker { image 'sonarsource/sonar-scanner-cli' }  // Usa SonarQube Scanner en Docker
            }
            steps {
                withCredentials([string(credentialsId: 'sonarqube', variable: 'sonarLogin')]) {
                    sh """
                    sonar-scanner \
                    -Dsonar.host.url=http://sonarqube:9000 \
                    -Dsonar.login=${sonarLogin} \
                    -Dsonar.projectName=mi-portfolio \
                    -Dsonar.projectVersion=${env.BUILD_NUMBER} \
                    -Dsonar.projectKey=PORTFOLIO \
                    -Dsonar.sources=. \
                    -Dsonar.exclusions=node_modules/**,dist/** \
                    -Dsonar.language=js \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    """
                }
            }
        }

        stage('Construcción de la Imagen Docker') {
            agent {
                docker { image 'docker:latest' }  // Usa Docker en Docker
            }
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Publicación de la Imagen Docker') {
            agent {
                docker { image 'docker:latest' }
            }
            steps {
                withCredentials([string(credentialsId: 'docker-hub-token', variable: 'DOCKER_HUB_TOKEN')]) {
                    sh """
                    echo ${DOCKER_HUB_TOKEN} | docker login -u ${DOCKER_REGISTRY} --password-stdin
                    docker push ${DOCKER_IMAGE}
                    """
                }
            }
        }

        stage('Despliegue en Servidor Remoto') {
            agent {
                docker { image 'alpine' }  // Usa Alpine para el despliegue ligero
            }
            steps {
                script {
                    sshagent(['deploy-server-credentials']) {
                        sh """
                        ssh ${DEPLOY_SERVER} << 'EOF'
                        docker pull ${DOCKER_IMAGE}
                        docker stop ${APP_CONTAINER_NAME} || true
                        docker rm ${APP_CONTAINER_NAME} || true
                        docker run -d --name ${APP_CONTAINER_NAME} --network proxy -p ${APP_PORT}:${APP_PORT} ${DOCKER_IMAGE}
                        EOF
                        """
                    }
                }
            }
        }
    }
}
