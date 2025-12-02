# 🏛️ National Digital Document Vault — Competition Version

A complete, competition-ready blockchain-based document storage and verification system with AI-powered authenticity checks, multi-signature approvals, encrypted storage, and mobile offline verification.

## 🎯 Overview

The National Digital Document Vault is a comprehensive system that allows citizens to securely store and verify official documents (birth certificates, property deeds, degrees, etc.) using blockchain technology, AI, and modern web/mobile technologies. The system demonstrates transparency, immutability, and usability.

## ✨ Key Features (All 10 Implemented)

### 1. Government Agency Verification Portal ✅
- Role-based dashboards for:
  - Birth & Deaths Office
  - Land Registry
  - Education Ministry
  - Immigration
  - Courts
- Agencies can approve documents, upload verified copies, apply digital seals, and view audit logs
- Blockchain records each approval
- **Access**: `/government` route (Government Officer/Admin only)

### 2. AI-Powered Document Authenticity Pre-Check ✅
- Detects forgery, manipulation, duplicate templates, and low-quality scans
- Uses lightweight AI modules:
  - OpenCV for image analysis
  - Tesseract.js for OCR and structure analysis
  - Quality checks (resolution, contrast)
  - Manipulation detection
- Provides simple AI feedback before storing documents
- **Location**: `backend/utils/aiPreCheck.js`

### 3. Mobile App with Offline Verification ✅
- React Native app to scan QR codes and verify documents
- Offline verification using cached blockchain state
- Syncs when online, supports hash/Merkle root verification
- **Location**: `mobile/` directory

### 4. Encrypted Document Storage ✅
- AES-256 client-side encryption before upload
- Store files in S3/MinIO/Supabase (configurable)
- Blockchain stores only hashes
- Encryption key management
- **Location**: `backend/utils/encryption.js`, `backend/services/storage.js`

### 5. Multi-Signature Government Approvals ✅
- Support documents requiring multiple signatures (e.g., Ministry, Surveyor, Owner)
- Smart contract enforces threshold before marking document fully approved
- Configurable approval requirements per document
- **Location**: Smart contract `DocVault.sol`

### 6. Verifiable PDF Certificate Output ✅
- Generate PDF certificates for verified documents
- Includes:
  - QR code
  - Blockchain transaction hash
  - Document hash
  - Timestamp
  - Digital signature
- **Location**: `backend/utils/pdfGenerator.js`
- **Access**: `/api/upload/certificate/:documentId`

### 7. Public Registry of Verified Records ✅
- Searchable directory of verified documents
- Non-sensitive metadata only (name, document type, hash)
- Search by name, document type, hash
- **Access**: `/registry` route

### 8. Decentralized Backup Nodes ✅
- Multiple backend nodes for redundancy and uptime
- Data synced across nodes
- Blockchain ensures consistency
- **Location**: `backend/utils/multiNode.js`
- **Configuration**: `BACKUP_NODES` environment variable

### 9. Role-Based Access Control (RBAC) ✅
- Roles:
  - Citizen
  - Government Officer
  - Institution
  - Auditor
  - Admin
- JWT-based access control for all routes
- Permissions: upload, approve, access metadata, admin tasks
- **Location**: `backend/middleware/auth.js`

### 10. On-Chain Audit Logging ✅
- Smart contract logs all actions: upload, verification, approval
- Records timestamps, user address, IP (hashed)
- Immutable audit trail
- **Location**: Smart contract `DocVault.sol`

## 🏗️ Architecture & Tech Stack

### Frontend
- **React** (Vite) - Citizen dashboard, Government portal, Public registry
- **PDF generation** - Client-side certificate generation
- **AI pre-check feedback** - Real-time authenticity results

### Mobile
- **React Native** (Expo) - Offline verification, QR scanning
- **AsyncStorage** - Local cache for offline verification

### Backend
- **Node.js + Express** - RESTful API
- **Multer** - File uploads
- **SHA-256** - Hashing
- **AI pre-check module** - Document authenticity
- **AES encryption** - Client-side encryption support
- **RBAC** - Role-based access control
- **PDF generation** - Certificate creation
- **Multi-node support** - Decentralized backup

### Blockchain
- **Solidity + Hardhat** - Smart contracts
- **Ethers.js** - Blockchain interactions
- **Multi-signature approvals** - Threshold-based verification
- **Document hash storage** - Immutable records
- **Audit logs** - On-chain logging

### Database
- **MongoDB** - Role management, metadata storage, verification logs

### Storage
- **MinIO/S3/Supabase** - Encrypted file storage (configurable)
- **Local filesystem** - Fallback option

### Security
- **JWT authentication** - Token-based auth
- **HTTPS support** - Secure connections
- **Rate limiting** - API protection
- **Input validation** - Sanitization
- **Audit logging** - Comprehensive tracking

## 📁 Project Structure

```
national-digital-vault/
├── blockchain/              # Hardhat project
│   ├── contracts/          # Solidity smart contracts
│   │   └── DocVault.sol   # Main contract with all features
│   ├── scripts/           # Deployment scripts
│   └── package.json
├── backend/               # Node.js + Express API
│   ├── config/           # Database configuration
│   ├── models/           # MongoDB models (User, Document)
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication
│   │   ├── upload.js     # Document upload with AI check
│   │   ├── verify.js     # Document verification
│   │   ├── government.js # Government portal
│   │   ├── registry.js   # Public registry
│   │   └── documents.js  # Document management
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Utilities
│   │   ├── aiPreCheck.js # AI authenticity check
│   │   ├── encryption.js # AES encryption
│   │   ├── pdfGenerator.js # PDF certificates
│   │   └── multiNode.js   # Multi-node sync
│   ├── services/         # Services
│   │   └── storage.js    # Storage service (MinIO/S3)
│   └── server.js         # Main server
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UploadForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GovernmentPortal.jsx
│   │   │   ├── PublicRegistry.jsx
│   │   │   └── ...
│   │   ├── context/      # React context
│   │   │   └── AuthContext.jsx
│   │   └── App.jsx
│   └── package.json
├── mobile/               # React Native app
│   ├── App.js           # Main app component
│   ├── package.json
│   └── README.md
├── scripts/             # Deployment scripts
│   ├── deploy.sh
│   └── start-all.sh
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or connection string)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd national-digital-vault
```

2. **Install dependencies**
```bash
# Install blockchain dependencies
cd blockchain && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

3. **Configure environment**
```bash
# Copy example env file
cp backend/.env.example backend/.env

# Edit backend/.env with your configuration
# - MongoDB URI
# - Blockchain RPC URL
# - JWT Secret
# - Storage configuration (optional)
```

4. **Start Hardhat node**
```bash
cd blockchain
npm run node
# Keep this terminal open
```

5. **Deploy smart contract** (in a new terminal)
```bash
cd blockchain
npm run deploy
# Copy the contract address to backend/.env
```

6. **Start backend**
```bash
cd backend
npm start
```

7. **Start frontend**
```bash
cd frontend
npm run dev
```

8. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Hardhat Node: http://localhost:8545

## 📖 Usage Guide

### For Citizens

1. **Register/Login**: Create an account or login
2. **Upload Document**: 
   - Select document file
   - Choose document type
   - Set required approvals (if needed)
   - Optionally enable encryption
   - Review AI pre-check results
   - Upload
3. **View Dashboard**: See all your uploaded documents
4. **Download Certificate**: Get PDF certificate for verified documents
5. **Verify Documents**: Use verification page or QR code

### For Government Officers

1. **Login**: Use government officer account
2. **Access Portal**: Go to Government Portal
3. **View Pending**: See documents awaiting approval
4. **Approve Documents**: Review and approve documents
5. **View Audit Logs**: Check all system activities

### For Public

1. **Access Registry**: Visit Public Registry page
2. **Search Documents**: Search by name, type, or hash
3. **Verify Documents**: View verification details

### Mobile App

1. **Install**: Use Expo Go or build native app
2. **Scan QR Code**: Scan document QR code
3. **Verify Offline**: Works offline with cached data
4. **Manual Entry**: Enter hash manually if needed

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Document Upload
- `POST /api/upload` - Upload document (with AI pre-check)
- `GET /api/upload/certificate/:documentId` - Download PDF certificate

### Verification
- `POST /api/verify/file` - Verify by file upload
- `GET /api/verify/hash/:hash` - Verify by hash

### Government Portal
- `GET /api/government/pending` - Get pending documents
- `POST /api/government/approve/:documentId` - Approve document
- `GET /api/government/dashboard` - Get dashboard stats
- `GET /api/government/audit` - Get audit logs

### Public Registry
- `GET /api/registry/search` - Search verified documents
- `GET /api/registry/document/:hash` - Get document details
- `GET /api/registry/stats` - Get statistics

### Documents
- `GET /api/documents` - Get all user documents
- `GET /api/documents/hash/:hash` - Get document by hash

## 🔒 Security Features

- ✅ AES-256 encryption (client-side)
- ✅ Immutable blockchain storage
- ✅ Dual verification (blockchain + database)
- ✅ RBAC with JWT
- ✅ HTTPS support
- ✅ Input sanitization
- ✅ Rate limiting
- ✅ Audit logs
- ✅ IP hashing for privacy

## 🧪 Testing

### Test Smart Contract
```bash
cd blockchain
npm run test
```

### Test Backend API
```bash
cd backend
npm test  # If tests are configured
```

## 📦 Deployment

### Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure production MongoDB
   - Set up production blockchain node
   - Configure storage (S3/MinIO)
   - Set secure JWT secret

2. **Build Frontend**
```bash
cd frontend
npm run build
```

3. **Deploy Backend**
   - Use PM2 or similar process manager
   - Configure reverse proxy (Nginx)
   - Enable HTTPS

4. **Deploy Smart Contract**
   - Deploy to production network (Ethereum, Polygon, etc.)
   - Update contract address in backend

5. **Multi-Node Setup**
   - Configure `BACKUP_NODES` in environment
   - Enable `ENABLE_NODE_SYNC=true`

## 🐛 Troubleshooting

### Contract Deployment Fails
- Ensure Hardhat node is running
- Check account has sufficient balance
- Verify contract compiles: `npm run compile`

### Backend Can't Connect to Blockchain
- Verify Hardhat node is running on port 8545
- Check `BLOCKCHAIN_RPC_URL` in `.env`
- Verify contract address is correct

### AI Pre-Check Fails
- Ensure Tesseract.js dependencies are installed
- Check file format is supported (PDF, images)
- Review error logs in console

### MongoDB Connection Issues
- Verify MongoDB is running
- Check `MONGO_URI` in `.env`
- Ensure network access is allowed

## 📝 License

This project is created for competition purposes.

## 🙏 Acknowledgments

Built with:
- Hardhat
- React
- Express.js
- MongoDB
- Ethers.js
- Tesseract.js
- And many other open-source libraries

---

**Competition Ready** ✅ All 10 features implemented and integrated!

