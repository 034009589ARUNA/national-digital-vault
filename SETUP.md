# 🚀 Quick Setup Guide

This guide will help you set up and run the National Digital Document Vault system from scratch.

## Prerequisites Checklist

- [ ] Node.js (v18+) installed
- [ ] MongoDB installed and running
- [ ] Git installed
- [ ] Terminal/Command Prompt ready

## Step-by-Step Setup

### 1️⃣ Install All Dependencies

Open your terminal and run these commands:

```bash
# Install blockchain dependencies
cd blockchain
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2️⃣ Start MongoDB

**Windows:**
```bash
# If MongoDB is installed as a service, it should start automatically
# Otherwise, start it manually from MongoDB installation directory
mongod
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# or
mongod
```

### 3️⃣ Configure Backend Environment

Create a `.env` file in the `backend` directory:

```bash
cd backend
```

Create `.env` with this content (you'll update `PRIVATE_KEY` and `CONTRACT_ADDRESS` in the next steps):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/docvault
PRIVATE_KEY=
CONTRACT_ADDRESS=
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
FRONTEND_URL=http://localhost:5173
```

### 4️⃣ Start Hardhat Local Node

**Open Terminal 1:**

```bash
cd blockchain
npm run node
```

**Important:** Keep this terminal open! The Hardhat node must stay running.

You'll see output like this:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

**Copy one of the private keys** (e.g., Account #0's private key) and update your `backend/.env` file:

```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 5️⃣ Deploy Smart Contract

**Open Terminal 2:**

```bash
cd blockchain
npm run deploy
```

You should see:
```
Deploying DocVault contract...
DocVault deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ABI saved to: .../backend/contract/DocVault.json
Contract address saved to backend/.env
```

The contract address is automatically saved to `backend/.env`. Verify it's there:

```bash
cat ../backend/.env
```

You should see `CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3` (or similar).

### 6️⃣ Start Backend Server

**Open Terminal 3:**

```bash
cd backend
npm start
```

You should see:
```
MongoDB Connected: localhost:27017
Blockchain connection initialized
🚀 Server running on port 5000
```

### 7️⃣ Start Frontend

**Open Terminal 4:**

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## ✅ Verification

1. Open your browser and go to `http://localhost:5173`
2. You should see the "National Digital Document Vault" homepage
3. Try uploading a test document (any PDF, image, or text file)
4. Check the Dashboard to see your uploaded document
5. Try verifying a document

## 🎯 System Status

Your system is running when you have:

- ✅ **Terminal 1**: Hardhat node running (port 8545)
- ✅ **Terminal 2**: (Can be closed after deployment)
- ✅ **Terminal 3**: Backend server running (port 5000)
- ✅ **Terminal 4**: Frontend dev server running (port 5173)
- ✅ **MongoDB**: Running (port 27017)

## 🔄 Restarting the System

If you need to restart:

1. **Stop all processes** (Ctrl+C in each terminal)
2. **Restart Hardhat node**: `cd blockchain && npm run node`
3. **Redeploy contract** (if needed): `cd blockchain && npm run deploy`
4. **Restart backend**: `cd backend && npm start`
5. **Restart frontend**: `cd frontend && npm run dev`

## 🐛 Common Issues

### Issue: "Cannot connect to MongoDB"
**Solution:** Make sure MongoDB is running. Check with:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl status mongod
```

### Issue: "Blockchain not initialized"
**Solution:** 
- Ensure Hardhat node is running
- Check `CONTRACT_ADDRESS` is set in `backend/.env`
- Verify `PRIVATE_KEY` matches one of the Hardhat accounts

### Issue: "Contract deployment fails"
**Solution:**
- Make sure Hardhat node is running first
- Check you're in the `blockchain` directory
- Try `npm run compile` first to check for errors

### Issue: "Frontend can't connect to backend"
**Solution:**
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL

## 📚 Next Steps

- Upload your first document
- Explore the Dashboard
- Test document verification
- Scan QR codes with your phone
- Share verification URLs

---

**Need Help?** Check the main `README.md` for detailed documentation.

