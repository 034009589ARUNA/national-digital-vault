@echo off
echo ========================================
echo  Starting Hackathon Demo Environment
echo ========================================
echo.

echo [1/3] Starting Hardhat Blockchain Node...
start "Hardhat Node" cmd /k "cd blockchain && echo Starting Hardhat Node... && npm run node"
timeout /t 5 /nobreak

echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && echo Starting Backend... && npm start"
timeout /t 5 /nobreak

echo [3/3] Starting Frontend Dev Server...
start "Frontend" cmd /k "cd frontend && echo Starting Frontend... && npm run dev"

echo.
echo ========================================
echo  Demo Environment Starting!
echo ========================================
echo.
echo Frontend will open at: http://localhost:5173
echo Backend API at: http://localhost:5000
echo Blockchain Node at: http://localhost:8545
echo.
echo Press any key to exit this window (services will keep running)...
pause >nul

