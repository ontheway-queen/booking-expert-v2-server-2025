pipeline {
    agent any
    stages {
        stage('Install Dependencies') {
            steps {
                sh '''
                    npm ci || npm install
                '''
            }
        }
        stage('Restart App with PM2') {
            steps {
                sh '''
                    echo "PM2 found, restarting all apps..."
                    pm2 restart all --update-env
                '''
            }
        }
    }
}