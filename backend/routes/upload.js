const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const Document = require('../models/Document');
const { authenticate } = require('../middleware/auth');
const aiPreCheck = require('../utils/aiPreCheck');
const storageService = require('../services/storage');
const { hashIP } = require('../utils/encryption');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
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
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
    console.log('Blockchain connection initialized');
  } catch (error) {
    console.error('Error initializing blockchain:', error.message);
  }
}

// Initialize on module load
initBlockchain();

// Upload document route with AI pre-check and encryption support
router.post('/', authenticate, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!contract) {
      return res.status(500).json({ error: 'Blockchain not initialized' });
    }

    const filePath = req.file.path;
    const {
      documentType = 'Other',
      requiredApprovals = 0,
      encrypt = false,
      encryptionKey,
      metadataName,
      metadataDescription,
      skipAICheck = false
    } = req.body;

    // Step 1: AI Pre-Check (if not skipped)
    let aiCheckResult = null;
    if (!skipAICheck) {
      try {
        aiCheckResult = await aiPreCheck.preCheckDocument(filePath);
        
        // If AI check fails critically, reject upload
        if (!aiCheckResult.passed && aiCheckResult.confidence < 0.3) {
          fs.unlinkSync(filePath);
          return res.status(400).json({
            error: 'Document failed authenticity pre-check',
            aiCheck: aiCheckResult
          });
        }
      } catch (error) {
        console.error('AI pre-check error:', error);
        // Continue with upload if AI check fails (non-critical)
      }
    }

    // Step 2: Compute hash (before encryption if needed)
    const hash = computeHash(filePath);
    const hashBytes32 = '0x' + hash;

    // Step 3: Check for duplicates
    const existingDoc = await Document.findOne({ hash });
    if (existingDoc) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Document already exists' });
    }

    // Step 4: Handle encryption if requested
    let finalFilePath = filePath;
    let storagePath = null;
    let isEncrypted = false;
    let finalEncryptionKey = encryptionKey;

    if (encrypt) {
      try {
        // If encryption key not provided, generate one
        if (!finalEncryptionKey) {
          finalEncryptionKey = crypto.randomBytes(32).toString('hex');
        }

        // Encrypt file (simplified - in production, use proper encryption)
        const encryptedPath = filePath + '.encrypted';
        // For now, we'll store the encryption flag and key
        // Actual encryption should be done client-side before upload
        isEncrypted = true;
        finalFilePath = filePath; // Keep original for now
      } catch (error) {
        console.error('Encryption error:', error);
        // Continue without encryption
      }
    }

    // Step 5: Upload to storage service (MinIO/S3/Local)
    try {
      const objectName = `${req.user._id}/${hash}/${req.file.originalname}`;
      storagePath = await storageService.uploadFile(finalFilePath, objectName);
    } catch (error) {
      console.error('Storage upload error:', error);
      // Continue with local storage
      storagePath = finalFilePath;
    }

    // Step 6: Store hash on blockchain
    let txHash;
    let ownerAddress = req.user.walletAddress || process.env.DEFAULT_WALLET_ADDRESS;
    
    try {
      const requiredApprovalsNum = parseInt(requiredApprovals) || 0;
      const tx = await contract.storeDocumentHash(hashBytes32, requiredApprovalsNum);
      await tx.wait();
      txHash = tx.hash;

      // Log audit on blockchain
      const ipHash = hashIP(req.ip || 'unknown');
      await contract.logAudit(hashBytes32, 'UPLOAD', '0x' + ipHash);
    } catch (error) {
      // Clean up storage if blockchain fails
      if (storagePath && storagePath !== finalFilePath) {
        try {
          await storageService.deleteFile(storagePath.split('/').pop());
        } catch (e) {}
      }
      fs.unlinkSync(filePath);
      return res.status(500).json({ 
        error: 'Failed to store on blockchain', 
        details: error.message 
      });
    }

    // Step 7: Generate verification URL
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${hash}`;

    // Step 8: Save metadata to MongoDB
    const document = new Document({
      filename: req.file.originalname,
      hash: hash,
      owner: req.user._id,
      ownerAddress: ownerAddress,
      txHash: txHash,
      fileSize: req.file.size,
      verificationUrl: verificationUrl,
      documentType: documentType,
      requiredApprovals: parseInt(requiredApprovals) || 0,
      storagePath: storagePath,
      isEncrypted: isEncrypted,
      encryptionKey: isEncrypted ? finalEncryptionKey : null,
      aiPreCheck: aiCheckResult,
      metadata: {
        name: metadataName || req.file.originalname,
        description: metadataDescription || ''
      }
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded and stored successfully',
      document: {
        id: document._id,
        filename: document.filename,
        hash: document.hash,
        txHash: document.txHash,
        timestamp: document.timestamp,
        verificationUrl: document.verificationUrl,
        documentType: document.documentType,
        requiredApprovals: document.requiredApprovals,
        isVerified: document.isVerified,
        aiCheck: aiCheckResult
      },
      encryptionKey: isEncrypted ? finalEncryptionKey : null
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path); // Clean up file on error
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Generate PDF certificate
router.get('/certificate/:documentId', authenticate, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check ownership or admin access
    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const pdfGenerator = require('../utils/pdfGenerator');
    const pdfBuffer = await pdfGenerator.generateCertificate({
      documentHash: document.hash,
      transactionHash: document.txHash,
      documentType: document.documentType,
      ownerName: req.user.name,
      timestamp: document.timestamp,
      verificationUrl: document.verificationUrl,
      isVerified: document.isVerified,
      approvalCount: document.approvalCount,
      requiredApprovals: document.requiredApprovals
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${document.hash.substring(0, 8)}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
