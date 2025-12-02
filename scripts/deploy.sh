#!/bin/bash

# National Digital Document Vault - Deployment Script
# This script deploys the entire system

set -e

echo "🏛️ National Digital Document Vault - Deployment Script"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if MongoDB is running (optional check)
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Step 1: Install blockchain dependencies
echo -e "${GREEN}Step 1: Installing blockchain dependencies...${NC}"
cd blockchain
npm install
cd ..

# Step 2: Install backend dependencies
echo -e "${GREEN}Step 2: Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Step 3: Install frontend dependencies
echo -e "${GREEN}Step 3: Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

# Step 4: Compile smart contracts
echo -e "${GREEN}Step 4: Compiling smart contracts...${NC}"
cd blockchain
npm run compile
cd ..

# Step 5: Check for .env file
echo -e "${YELLOW}Step 5: Checking configuration...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Warning: backend/.env not found. Creating from .env.example...${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}Please update backend/.env with your configuration${NC}"
    else
        echo -e "${RED}Error: backend/.env.example not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start Hardhat node: cd blockchain && npm run node"
echo "2. Deploy contract: cd blockchain && npm run deploy"
echo "3. Update CONTRACT_ADDRESS in backend/.env"
echo "4. Start backend: cd backend && npm start"
echo "5. Start frontend: cd frontend && npm run dev"

