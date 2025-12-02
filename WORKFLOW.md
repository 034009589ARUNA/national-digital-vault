# 🔄 System Workflow

This document explains how the National Digital Document Vault system works end-to-end.

## 📤 Document Upload Flow

1. **User uploads document** via frontend (`UploadForm.jsx`)
2. **Backend receives file** via Multer middleware
3. **Hash computation**: Backend computes SHA-256 hash of the file
4. **MongoDB check**: System checks if document hash already exists
5. **Blockchain storage**: 
   - Hash is sent to smart contract via Ethers.js
   - Smart contract stores hash and emits `DocumentStored` event
   - Transaction hash is returned
6. **Metadata storage**: Document metadata saved to MongoDB:
   - Filename
   - Hash
   - Owner address
   - Transaction hash
   - Timestamp
   - Verification URL
7. **Response**: Frontend receives upload confirmation with:
   - Document hash
   - Blockchain transaction hash
   - Verification URL

## ✅ Document Verification Flow

### Method 1: File Upload Verification

1. **User uploads document** to verify
2. **Hash computation**: System computes SHA-256 hash
3. **Blockchain check**: 
   - Query smart contract `verifyDocument(hash)`
   - Check if hash exists and get owner
4. **Database check**: 
   - Query MongoDB for document metadata
   - Retrieve filename, timestamp, txHash
5. **Verification result**:
   - ✅ **VERIFIED**: Hash exists on both blockchain AND database
   - ❌ **NOT VERIFIED**: Hash missing from blockchain or database

### Method 2: Hash-based Verification

1. **User provides hash** (via URL parameter)
2. **Blockchain check**: Query contract for hash
3. **Database check**: Query MongoDB for metadata
4. **Display proof page** with:
   - Verification status
   - Blockchain transaction details
   - Document metadata
   - QR code for sharing

## 🏗️ Architecture Components

### Smart Contract (`DocVault.sol`)

**Functions:**
- `storeDocumentHash(bytes32 hash)`: Stores hash on blockchain
- `verifyDocument(bytes32 hash)`: Checks if hash exists
- `getHashOwner(bytes32 hash)`: Returns owner of hash
- `getDocumentHashes(address user)`: Returns all hashes for user

**Storage:**
- `hashToOwner`: Maps hash → owner address
- `userHashes`: Maps user → array of hashes

**Events:**
- `DocumentStored(address user, bytes32 hash)`: Emitted on storage

### Backend API

**Routes:**
- `POST /api/upload`: Upload and store document
- `POST /api/verify/file`: Verify document by file
- `GET /api/verify/hash/:hash`: Verify document by hash
- `GET /api/documents`: Get all documents
- `GET /api/documents/hash/:hash`: Get document by hash

**Key Operations:**
- File handling with Multer
- SHA-256 hash computation
- MongoDB CRUD operations
- Blockchain interactions via Ethers.js

### Frontend Components

**Pages:**
- **Upload**: Document upload interface
- **Dashboard**: View all uploaded documents
- **Verify**: Document verification tool
- **Proof Page**: Public verification result page

**Features:**
- File upload with drag-and-drop UI
- QR code generation for verification URLs
- Real-time verification status
- Blockchain transaction display

## 🔐 Security Considerations

### Current MVP Implementation

- ✅ Cryptographic hashing (SHA-256)
- ✅ Immutable blockchain storage
- ✅ Database metadata storage
- ✅ Dual verification (blockchain + database)

### Production Enhancements Needed

- 🔒 User authentication and authorization
- 🔒 Access control for blockchain operations
- 🔒 Rate limiting on API endpoints
- 🔒 Input validation and sanitization
- 🔒 Secure file storage (encryption at rest)
- 🔒 HTTPS/SSL certificates
- 🔒 Environment variable security
- 🔒 Audit logging

## 📊 Data Flow Diagram

```
User Upload
    ↓
Frontend (React)
    ↓
Backend API (Express)
    ↓
    ├─→ Compute SHA-256 Hash
    ├─→ Check MongoDB (duplicate check)
    ├─→ Store on Blockchain (Ethers.js → Smart Contract)
    └─→ Save Metadata to MongoDB
    ↓
Response to Frontend
    ↓
Display: Hash, TX Hash, Verification URL
```

```
User Verification
    ↓
Frontend (React)
    ↓
Backend API (Express)
    ↓
    ├─→ Compute SHA-256 Hash (if file upload)
    ├─→ Query Blockchain (verifyDocument)
    └─→ Query MongoDB (metadata)
    ↓
Response to Frontend
    ↓
Display: VERIFIED / NOT VERIFIED + Details
```

## 🎯 Key Features

1. **Immutable Storage**: Document hashes stored on blockchain cannot be altered
2. **Dual Verification**: Checks both blockchain and database for authenticity
3. **QR Code Sharing**: Easy verification via QR code scanning
4. **Public Proof Pages**: Shareable verification URLs
5. **Transaction Transparency**: All blockchain transactions are visible and verifiable

## 🔄 Typical User Journey

1. **Citizen uploads document** (e.g., birth certificate)
2. **System generates hash** and stores on blockchain
3. **Citizen receives verification URL** and QR code
4. **Later, verification needed**:
   - Option A: Upload document again → System verifies
   - Option B: Share verification URL → Anyone can verify
   - Option C: Scan QR code → Opens proof page
5. **Verification result** shows:
   - ✅ Document is authentic
   - Blockchain transaction proof
   - Upload timestamp
   - Document metadata

---

This workflow ensures transparency, immutability, and easy verification of official documents.

