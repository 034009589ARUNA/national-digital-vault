# 🚀 Complete Setup Guide

This guide will help you set up the entire National Digital Document Vault system from scratch.

## Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
   - Verify: `mongod --version`

3. **Git**
   - Download from: https://git-scm.com/

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Navigate to project root
cd national-digital-vault

# Install blockchain dependencies
cd blockchain
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Configure Backend

1. Create `.env` file in `backend/` directory:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your configuration:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/docvault
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

### Step 3: Start Hardhat Blockchain Node

Open a terminal and run:
```bash
cd blockchain
npm run node
```

**Keep this terminal open!** The node will display accounts with private keys. Copy one of the private keys for your `backend/.env` file.

### Step 4: Deploy Smart Contract

Open a **new terminal** and run:
```bash
cd blockchain
npm run deploy
```

This will:
- Compile the smart contract
- Deploy it to the local Hardhat node
- Save the contract address to `backend/contract/DocVault.json`
- Update `backend/.env` with the contract address

**Copy the contract address** and update `CONTRACT_ADDRESS` in `backend/.env` if needed.

### Step 5: Start Backend Server

Open a **new terminal** and run:
```bash
cd backend
npm start
```

The server should start on `http://localhost:5000`

### Step 6: Start Frontend

Open a **new terminal** and run:
```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:5173`

## First Run Instructions

### 1. Create Admin Account

Visit `http://localhost:5173/register` and create an account with role "Admin"

### 2. Create Test Users

Create additional accounts:
- **Citizen**: Regular user account
- **Government Officer**: Select role "Government Officer" and choose an agency

### 3. Test Document Upload

1. Login as a Citizen
2. Go to Upload page
3. Select a document (PDF or image)
4. Fill in document details
5. Review AI pre-check results
6. Upload the document

### 4. Test Government Approval

1. Login as a Government Officer
2. Go to Government Portal
3. View pending documents
4. Approve a document

### 5. Test Verification

1. Go to Verify page
2. Upload a document or enter hash
3. View verification results

### 6. Test Public Registry

1. Go to Public Registry page
2. Search for verified documents
3. View document details

## Mobile App Setup

### Prerequisites
- Node.js
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android)

### Setup
```bash
cd mobile
npm install
```

### Run
```bash
npm start
```

Scan the QR code with Expo Go app.

**Note**: Update `API_BASE_URL` in `mobile/App.js` to point to your backend server.

## Optional: Storage Configuration

### MinIO Setup
1. Install MinIO: https://min.io/download
2. Start MinIO server
3. Update `backend/.env`:
```env
USE_MINIO=true
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### AWS S3 Setup
1. Create AWS account and S3 bucket
2. Get access keys
3. Update `backend/.env`:
```env
USE_S3=true
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`
- Try: `mongodb://127.0.0.1:27017/docvault`

### Blockchain Connection Error
- Ensure Hardhat node is running
- Check `BLOCKCHAIN_RPC_URL` in `.env`
- Verify contract address is set

### Port Already in Use
- Change `PORT` in `backend/.env`
- Or stop the process using the port

### AI Pre-Check Not Working
- Ensure all dependencies are installed: `npm install` in backend
- Check file format is supported
- Review console logs for errors

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use process manager (PM2): `pm2 start server.js`
3. Configure reverse proxy (Nginx)
4. Enable HTTPS

### Frontend
1. Build: `npm run build`
2. Serve with Nginx or similar
3. Configure API URL

### Smart Contract
1. Deploy to production network (Ethereum, Polygon, etc.)
2. Update contract address in backend
3. Fund the contract owner account

## Support

For issues or questions, check:
- `README-COMPETITION.md` - Full feature documentation
- `WORKFLOW.md` - System workflow
- Console logs for error messages

---

**You're all set!** 🎉 Start exploring the system!

