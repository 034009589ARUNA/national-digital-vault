const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerAddress: {
    type: String,
    required: true
  },
  txHash: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  verificationUrl: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: ['BirthCertificate', 'DeathCertificate', 'PropertyDeed', 'Degree', 'Passport', 'CourtDocument', 'Other'],
    default: 'Other'
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  approvalCount: {
    type: Number,
    default: 0
  },
  requiredApprovals: {
    type: Number,
    default: 0
  },
  approvers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  storagePath: {
    type: String,
    default: null
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  encryptionKey: {
    type: String,
    default: null
  },
  aiPreCheck: {
    passed: Boolean,
    confidence: Number,
    issues: [String],
    warnings: [String],
    checks: mongoose.Schema.Types.Mixed
  },
  metadata: {
    name: String,
    description: String,
    tags: [String]
  },
  agency: {
    type: String,
    enum: ['BirthDeaths', 'LandRegistry', 'Education', 'Immigration', 'Courts', null],
    default: null
  }
}, {
  timestamps: true
});

// Indexes for search
documentSchema.index({ documentType: 1, isVerified: 1 });
documentSchema.index({ 'metadata.name': 'text', 'metadata.description': 'text' });

module.exports = mongoose.model('Document', documentSchema);

