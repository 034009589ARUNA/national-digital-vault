const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const Document = require('../models/Document');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to compute SHA-256 hash
function computeHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// Initialize blockchain connection
let contract = null;
let provider = null;

async function initBlockchain() {
  try {
    const contractABI = require('../contract/DocVault.json');
    provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545');
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
    console.log('Blockchain connection initialized for verification');
  } catch (error) {
    console.error('Error initializing blockchain:', error.message);
  }
}

// Initialize on module load
initBlockchain();

// Verify document by file upload
router.post('/file', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!contract) {
      return res.status(500).json({ error: 'Blockchain not initialized' });
    }

    const filePath = req.file.path;
    const hash = computeHash(filePath);
    const hashBytes32 = '0x' + hash;

    // Clean up temp file
    fs.unlinkSync(filePath);

    // Check blockchain
    const [exists, verified] = await contract.verifyDocument(hashBytes32);
    let blockchainOwner = null;
    if (exists) {
      try {
        const docData = await contract.getDocument(hashBytes32);
        blockchainOwner = docData.owner;
      } catch (error) {
        console.error('Error getting document owner:', error);
      }
    }

    // Check MongoDB
    const dbDocument = await Document.findOne({ hash });

    const verificationResult = {
      hash: hash,
      verified: false,
      blockchain: {
        exists: exists,
        verified: verified,
        owner: blockchainOwner
      },
      database: {
        exists: !!dbDocument,
        document: dbDocument ? {
          filename: dbDocument.filename,
          timestamp: dbDocument.timestamp,
          txHash: dbDocument.txHash
        } : null
      }
    };

    // Document is verified if it exists on both blockchain and database and is verified
    if (exists && verified && dbDocument) {
      verificationResult.verified = true;
    }

    res.json(verificationResult);
  } catch (error) {
    console.error('Verification error:', error);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Verify document by hash
router.get('/hash/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const hashBytes32 = '0x' + hash;

    if (!contract) {
      return res.status(500).json({ error: 'Blockchain not initialized' });
    }

    // Check blockchain
    const [exists, verified] = await contract.verifyDocument(hashBytes32);
    let blockchainOwner = null;
    if (exists) {
      try {
        const docData = await contract.getDocument(hashBytes32);
        blockchainOwner = docData.owner;
      } catch (error) {
        console.error('Error getting document owner:', error);
      }
    }

    // Check MongoDB
    const dbDocument = await Document.findOne({ hash });

    const verificationResult = {
      hash: hash,
      verified: false,
      blockchain: {
        exists: exists,
        verified: verified,
        owner: blockchainOwner
      },
      database: {
        exists: !!dbDocument,
        document: dbDocument ? {
          filename: dbDocument.filename,
          timestamp: dbDocument.timestamp,
          txHash: dbDocument.txHash
        } : null
      }
    };

    // Document is verified if it exists on both blockchain and database and is verified
    if (exists && verified && dbDocument) {
      verificationResult.verified = true;
    }

    res.json(verificationResult);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;

