const express = require('express');
const Document = require('../models/Document');
const router = express.Router();

/**
 * Public Registry of Verified Records
 * Searchable directory with non-sensitive metadata only
 */

// Search verified documents
router.get('/search', async (req, res) => {
  try {
    const { name, documentType, hash, limit = 50, offset = 0 } = req.query;

    const query = { isVerified: true };

    // Search by name (metadata)
    if (name) {
      query.$or = [
        { 'metadata.name': { $regex: name, $options: 'i' } },
        { filename: { $regex: name, $options: 'i' } }
      ];
    }

    // Filter by document type
    if (documentType) {
      query.documentType = documentType;
    }

    // Search by hash
    if (hash) {
      query.hash = hash;
    }

    const documents = await Document.find(query)
      .select('hash documentType timestamp metadata.name isVerified approvalCount')
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ timestamp: -1 });

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Registry search error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get document by hash (public metadata only)
router.get('/document/:hash', async (req, res) => {
  try {
    const document = await Document.findOne({ hash: req.params.hash, isVerified: true })
      .select('hash documentType timestamp metadata.name metadata.description isVerified approvalCount requiredApprovals verificationUrl')
      .populate('owner', 'name');

    if (!document) {
      return res.status(404).json({ error: 'Document not found or not verified' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Registry document error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get document types statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Document.aggregate([
      { $match: { isVerified: true } },
      {
        $group: {
          _id: '$documentType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = await Document.countDocuments({ isVerified: true });

    res.json({
      byType: stats,
      total
    });
  } catch (error) {
    console.error('Registry stats error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;

