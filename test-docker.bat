@echo off
echo 🧪 Testing Dockerfile locally...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is installed

REM Create .env file for local testing if it doesn't exist
if not exist qlue.server\.env (
    echo 📝 Creating .env file for local testing...
    (
        echo DATABASE_URL="postgresql://test:test@localhost:5432/qlue_test"
        echo JWT_SECRET="local-test-secret-key"
        echo ANTHROPIC_API_KEY="test-key"
        echo OPENAI_API_KEY="test-key"
        echo QLOO_API_KEY="test-key"
        echo CLIENT_URL="http://localhost:3000"
    ) > qlue.server\.env
    echo ⚠️  Created .env with test values. Update with real values for production.
)

echo 🔨 Building Docker image...
cd qlue.server
docker build -t qlue-server:test .

if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)

echo ✅ Docker image built successfully!

echo 🚀 Running container...
docker run -d --name qlue-server-test -p 8080:8080 --env-file .env qlue-server:test

if %errorlevel% neq 0 (
    echo ❌ Failed to start container!
    pause
    exit /b 1
)

echo ⏳ Waiting for server to start...
timeout /t 15 /nobreak >nul

echo 🔍 Checking container status...
docker ps

echo 📊 Checking logs...
docker logs qlue-server-test

echo.
echo 🌐 Your server should be available at:
echo    Backend API: http://localhost:8080
echo    Health check: http://localhost:8080/api/health
echo.
echo 🔧 Useful commands:
echo    View logs: docker logs -f qlue-server-test
echo    Stop container: docker stop qlue-server-test
echo    Remove container: docker rm qlue-server-test
echo    Remove image: docker rmi qlue-server:test
echo.
pause 