const express = require('express');
const Document = require('../models/Document');
const router = express.Router();

// Get all documents (in a real app, this would be filtered by user)
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find().sort({ timestamp: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get document by hash
router.get('/hash/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const document = await Document.findOne({ hash });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;

