# 🏛️ National Digital Document Vault

A complete MVP for a blockchain-based document storage and verification system. This system allows citizens to upload official documents, generate cryptographic hashes, store metadata in MongoDB, and record hashes immutably on the blockchain.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the System](#running-the-system)
- [Usage Guide](#usage-guide)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)

## ✨ Features

1. **Document Upload**: Upload official documents with automatic hash generation
2. **Blockchain Storage**: Immutable storage of document hashes on Ethereum blockchain
3. **Document Verification**: Verify document authenticity against blockchain and database
4. **Dashboard**: View all uploaded documents with metadata
5. **QR Code Generation**: Generate QR codes for easy document verification
6. **Proof Page**: Public verification page with blockchain transaction details

## 📁 Project Structure

```
national-digital-vault/
├── blockchain/          # Hardhat project with smart contracts
│   ├── contracts/       # Solidity smart contracts
│   ├── scripts/         # Deployment scripts
│   └── package.json
├── backend/             # Node.js + Express + MongoDB
│   ├── config/          # Database configuration
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── contract/        # Contract ABI (generated after deployment)
│   └── server.js        # Main server file
└── frontend/            # React + Vite application
    ├── src/
    │   ├── components/  # React components
    │   ├── api/         # API client
    │   └── App.jsx      # Main app component
    └── package.json
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (running locally or connection string)
- **Git**

## 📦 Installation

### Step 1: Install Blockchain Dependencies

```bash
cd blockchain
npm install
```

### Step 2: Install Backend Dependencies

```bash
cd ../backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/docvault
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- `PRIVATE_KEY`: Generate a new private key for testing (use Hardhat's default accounts for local development)
- `CONTRACT_ADDRESS`: Will be automatically populated after contract deployment
- `MONGO_URI`: Update if your MongoDB is running on a different host/port

### Getting a Private Key for Testing

When you start Hardhat node, it will display several accounts with private keys. You can use one of those for `PRIVATE_KEY` in your backend `.env` file.

## 🚀 Running the System

### Step 1: Start Local Hardhat Node

Open a terminal and run:

```bash
cd blockchain
npm run node
```

This starts a local Ethereum node on `http://127.0.0.1:8545`. **Keep this terminal open.**

The node will display several accounts with their private keys. Copy one of the private keys for your backend `.env` file.

### Step 2: Deploy Smart Contract

Open a **new terminal** and run:

```bash
cd blockchain
npm run deploy
```

This will:
- Compile the smart contract
- Deploy it to the local Hardhat node
- Save the ABI to `backend/contract/DocVault.json`
- Save the contract address to `backend/.env`

**Note:** Make sure the Hardhat node from Step 1 is still running.

### Step 3: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows (if installed as service, it should start automatically)
# Or start manually:
mongod

# On macOS/Linux:
sudo systemctl start mongod
# or
mongod
```

### Step 4: Update Backend .env

After deployment, check that `backend/.env` has the `CONTRACT_ADDRESS` populated. Also ensure `PRIVATE_KEY` is set to one of the Hardhat account private keys.

### Step 5: Start Backend Server

Open a **new terminal** and run:

```bash
cd backend
npm start
```

The server should start on `http://localhost:5000`.

### Step 6: Start Frontend Development Server

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:5173`.

## 📖 Usage Guide

### Uploading a Document

1. Navigate to `http://localhost:5173`
2. Click "Choose a file" and select a document
3. Click "Upload & Store on Blockchain"
4. Wait for the transaction to complete
5. You'll receive:
   - Document hash
   - Blockchain transaction hash
   - Verification URL

### Viewing Documents

1. Navigate to the Dashboard
2. View all uploaded documents
3. Click "Show QR" to see the QR code for verification
4. Click "View Verification Page" to see the proof page

### Verifying a Document

**Method 1: File Upload**
1. Navigate to the Verify page
2. Upload the document you want to verify
3. The system will check both blockchain and database
4. See verification result (VERIFIED or NOT VERIFIED)

**Method 2: Hash Verification**
1. Use the verification URL from the upload result
2. Or navigate to `/verify/{hash}` with the document hash
3. View the proof page with blockchain details

### Using QR Codes

1. From the Dashboard, click "Show QR" on any document
2. Scan the QR code with your phone
3. You'll be taken to the verification/proof page
4. The page shows complete verification details

## 🔌 API Endpoints

### Upload Document
```
POST /api/upload
Content-Type: multipart/form-data
Body: { document: File }
```

### Verify Document (File)
```
POST /api/verify/file
Content-Type: multipart/form-data
Body: { document: File }
```

### Verify Document (Hash)
```
GET /api/verify/hash/:hash
```

### Get All Documents
```
GET /api/documents
```

### Get Document by Hash
```
GET /api/documents/hash/:hash
```

### Health Check
```
GET /api/health
```

## 🛠️ Technology Stack

### Blockchain
- **Hardhat**: Development environment for Ethereum
- **Solidity**: Smart contract language
- **Ethers.js**: Ethereum library

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB ODM
- **Multer**: File upload handling
- **Crypto**: Hash generation

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **React Router**: Routing
- **Axios**: HTTP client
- **QRCode.react**: QR code generation

## 🔒 Security Notes

- This is an MVP for demonstration purposes
- For production use, implement:
  - User authentication and authorization
  - Rate limiting
  - Input validation and sanitization
  - Secure file storage
  - HTTPS/SSL certificates
  - Environment variable security
  - Access control for blockchain operations

## 🐛 Troubleshooting

### Contract Deployment Fails
- Ensure Hardhat node is running
- Check that you have sufficient balance (Hardhat accounts have default balance)
- Verify the contract compiles: `npm run compile`

### Backend Can't Connect to Blockchain
- Verify Hardhat node is running on port 8545
- Check `BLOCKCHAIN_RPC_URL` in `.env`
- Ensure contract is deployed and `CONTRACT_ADDRESS` is set

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify MongoDB is accessible on the specified host/port

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check CORS settings in `server.js`
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is an MVP project. For production use, additional features and security measures should be implemented.

---

**Built with ❤️ for the National Digital Document Vault**

