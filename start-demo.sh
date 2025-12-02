#!/bin/bash

echo "========================================"
echo " Starting Hackathon Demo Environment"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Start Hardhat node in background
echo "[1/3] Starting Hardhat Blockchain Node..."
cd blockchain
npm run node > /dev/null 2>&1 &
HARDHAT_PID=$!
cd ..
sleep 5

# Start Backend in background
echo "[2/3] Starting Backend Server..."
cd backend
npm start > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..
sleep 5

# Start Frontend (foreground)
echo "[3/3] Starting Frontend Dev Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo " Demo Environment Starting!"
echo "========================================"
echo ""
echo "Frontend will open at: http://localhost:5173"
echo "Backend API at: http://localhost:5000"
echo "Blockchain Node at: http://localhost:8545"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap "kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait

