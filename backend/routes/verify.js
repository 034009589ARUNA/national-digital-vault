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

// Helper function to safely check blockchain for document
async function checkBlockchain(hashBytes32) {
  let exists = false;
  let verified = false;
  let blockchainOwner = null;
  
  try {
    const result = await contract.verifyDocument(hashBytes32);
    
    // Handle different response formats from ethers.js
    if (Array.isArray(result)) {
      [exists, verified] = result;
    } else if (result && typeof result === 'object') {
      exists = result.exists !== undefined ? result.exists : false;
      verified = result.verified !== undefined ? result.verified : false;
    } else {
      // Unexpected format, default to false
      exists = false;
      verified = false;
    }
    
    // If document exists, try to get owner
    if (exists) {
      try {
        const docData = await contract.getDocument(hashBytes32);
        if (docData) {
          // Handle both tuple and object responses
          if (typeof docData === 'object' && docData.owner) {
            blockchainOwner = docData.owner;
          } else if (Array.isArray(docData) && docData[0]) {
            blockchainOwner = docData[0];
          }
        }
      } catch (error) {
        console.error('Error getting document owner:', error.message);
        // Continue without owner info
      }
    }
  } catch (error) {
    // Document doesn't exist on blockchain or contract call failed
    // This is expected for documents that haven't been uploaded
    if (error.code === 'BAD_DATA' || error.message.includes('decode')) {
      console.log(`Document hash not found on blockchain (expected for new documents)`);
    } else {
      console.error('Blockchain verification error:', error.message);
    }
    exists = false;
    verified = false;
  }
  
  return { exists, verified, owner: blockchainOwner };
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

    // Check blockchain with proper error handling
    const blockchainResult = await checkBlockchain(hashBytes32);

    // Check MongoDB
    const dbDocument = await Document.findOne({ hash });

    const verificationResult = {
      hash: hash,
      verified: false,
      blockchain: {
        exists: blockchainResult.exists,
        verified: blockchainResult.verified,
        owner: blockchainResult.owner
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
    if (blockchainResult.exists && blockchainResult.verified && dbDocument) {
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

    // Check blockchain with proper error handling
    const blockchainResult = await checkBlockchain(hashBytes32);

    // Check MongoDB
    const dbDocument = await Document.findOne({ hash });

    const verificationResult = {
      hash: hash,
      verified: false,
      blockchain: {
        exists: blockchainResult.exists,
        verified: blockchainResult.verified,
        owner: blockchainResult.owner
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
    if (blockchainResult.exists && blockchainResult.verified && dbDocument) {
      verificationResult.verified = true;
    }

    res.json(verificationResult);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
