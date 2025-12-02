require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const uploadRoutes = require('./routes/upload');
const verifyRoutes = require('./routes/verify');
const documentRoutes = require('./routes/documents');
const authRoutes = require('./routes/auth');
const governmentRoutes = require('./routes/government');
const registryRoutes = require('./routes/registry');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ID = process.env.NODE_ID || 'node-1';

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.'
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check with node info
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Document Vault API is running',
    nodeId: NODE_ID,
    timestamp: new Date().toISOString()
  });
});

// Multi-node sync endpoint (for decentralized backup)
app.get('/api/nodes', (req, res) => {
  const nodes = process.env.BACKUP_NODES ? process.env.BACKUP_NODES.split(',') : [];
  res.json({
    currentNode: NODE_ID,
    backupNodes: nodes,
    status: 'active'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/registry', registryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: 'Something went wrong!', 
    details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Node ID: ${NODE_ID}`);
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`✅ Verify endpoint: http://localhost:${PORT}/api/verify`);
  console.log(`🏛️  Government portal: http://localhost:${PORT}/api/government`);
  console.log(`📋 Public registry: http://localhost:${PORT}/api/registry`);
});
