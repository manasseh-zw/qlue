@echo off
echo 🧹 Cleaning up Docker test resources...

echo Stopping and removing test container...
docker stop qlue-server-test 2>nul
docker rm qlue-server-test 2>nul

echo Removing test image...
docker rmi qlue-server:test 2>nul

echo ✅ Cleanup complete!
echo.
pause 