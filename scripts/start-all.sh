#!/bin/bash

# Start all services for development

echo "🚀 Starting National Digital Document Vault..."

# Start Hardhat node in background
echo "Starting Hardhat node..."
cd blockchain
npm run node &
HARDHAT_PID=$!
cd ..
sleep 5

# Deploy contract
echo "Deploying smart contract..."
cd blockchain
npm run deploy
cd ..
sleep 3

# Start backend
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo "Hardhat: http://localhost:8545"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID; exit" INT
wait

