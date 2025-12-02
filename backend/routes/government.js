const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { authenticate, authorize, authorizeAgency } = require('../middleware/auth');
const { hashIP } = require('../utils/encryption');
const { ethers } = require('ethers');
const router = express.Router();

// Initialize blockchain connection
let contract = null;
let provider = null;

async function initBlockchain() {
  try {
    const contractABI = require('../contract/DocVault.json');
    provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
    console.log('Government portal blockchain initialized');
  } catch (error) {
    console.error('Blockchain initialization error:', error);
  }
}

initBlockchain();

// Get pending documents for agency
router.get('/pending', authenticate, authorize('GovernmentOfficer', 'Admin'), async (req, res) => {
  try {
    const agency = req.user.agency;
    const query = { isVerified: false };
    
    if (req.user.role !== 'Admin') {
      query.agency = agency;
    }

    const documents = await Document.find(query)
      .populate('owner', 'name email')
      .sort({ timestamp: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching pending documents:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Approve document
router.post('/approve/:documentId', authenticate, authorize('GovernmentOfficer', 'Admin'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check agency match
    if (req.user.role !== 'Admin' && document.agency !== req.user.agency) {
      return res.status(403).json({ error: 'Not authorized for this agency' });
    }

    // Check if already approved by this user
    if (document.approvers.includes(req.user._id)) {
      return res.status(400).json({ error: 'Document already approved by you' });
    }

    // Approve on blockchain
    if (!contract) {
      return res.status(500).json({ error: 'Blockchain not initialized' });
    }

    const hashBytes32 = '0x' + document.hash;
    const ipHash = hashIP(req.ip || 'unknown');
    
    try {
      const tx = await contract.approveDocument(hashBytes32);
      await tx.wait();

      // Log audit on blockchain
      await contract.logAudit(hashBytes32, 'APPROVE', '0x' + ipHash);

      // Update document
      document.approvers.push(req.user._id);
      document.approvalCount += 1;

      // Check if fully verified
      const docData = await contract.getDocument(hashBytes32);
      // getDocument returns tuple with named outputs: {owner, timestamp, isVerified, approvalCount, requiredApprovals}
      if (docData.isVerified) {
        document.isVerified = true;
      }

      await document.save();

      res.json({
        message: 'Document approved successfully',
        document: {
          id: document._id,
          approvalCount: document.approvalCount,
          requiredApprovals: document.requiredApprovals,
          isVerified: document.isVerified,
          transactionHash: tx.hash
        }
      });
    } catch (error) {
      console.error('Blockchain approval error:', error);
      res.status(500).json({ error: 'Failed to approve on blockchain', details: error.message });
    }
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get agency dashboard stats
router.get('/dashboard', authenticate, authorize('GovernmentOfficer', 'Admin'), async (req, res) => {
  try {
    const agency = req.user.agency;
    const query = {};
    
    if (req.user.role !== 'Admin') {
      query.agency = agency;
    }

    const total = await Document.countDocuments(query);
    const verified = await Document.countDocuments({ ...query, isVerified: true });
    const pending = await Document.countDocuments({ ...query, isVerified: false });
    const recent = await Document.find(query)
      .populate('owner', 'name email')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      stats: {
        total,
        verified,
        pending
      },
      recent
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get audit logs
router.get('/audit', authenticate, authorize('GovernmentOfficer', 'Auditor', 'Admin'), async (req, res) => {
  try {
    if (!contract) {
      return res.status(500).json({ error: 'Blockchain not initialized' });
    }

    const logCount = await contract.getAuditLogCount();
    const logs = [];
    const limit = parseInt(req.query.limit) || 50;
    const start = Math.max(0, Number(logCount) - limit);

    for (let i = start; i < logCount; i++) {
      try {
        const log = await contract.getAuditLog(i);
        logs.push({
          documentHash: log.documentHash,
          actor: log.actor,
          action: log.action,
          timestamp: new Date(Number(log.timestamp) * 1000).toISOString(),
          ipHash: log.ipHash
        });
      } catch (error) {
        // Skip invalid logs
        continue;
      }
    }

    res.json({ logs: logs.reverse() });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Upload verified document copy (for agencies)
router.post('/upload-verified', authenticate, authorize('GovernmentOfficer', 'Admin'), [
  body('documentHash').notEmpty(),
  body('documentType').isIn(['BirthCertificate', 'DeathCertificate', 'PropertyDeed', 'Degree', 'Passport', 'CourtDocument', 'Other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { documentHash, documentType } = req.body;

    // Find or create document
    let document = await Document.findOne({ hash: documentHash });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update document type and mark for agency
    document.documentType = documentType;
    document.agency = req.user.agency;
    await document.save();

    res.json({
      message: 'Verified document uploaded',
      document
    });
  } catch (error) {
    console.error('Upload verified error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;

