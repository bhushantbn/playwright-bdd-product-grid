pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.44.1-jammy'
            args '-u root'
        }
    }
    
    environment {
        ENV = 'dev'
        // Assumes credentials binding for Jenkins server configuration
        AZURE_STORAGE_CONNECTION_STRING = credentials('azure-storage-connection-string')
        AZURE_CONTAINER_NAME = 'jenkins-test-artifacts'
    }
    
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Build Project') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Execute Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    sh 'npm run test'
                }
            }
        }
        
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }
    }
}
