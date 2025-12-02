/**
 * Demo Data Seeding Script for Hackathon
 * 
 * This script creates sample data for demonstration purposes:
 * - Sample users (Citizens, Government Officers)
 * - Sample documents with various statuses
 * - Pre-populated verification data
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Document = require('../models/Document');
require('dotenv').config();

// Demo data
const demoUsers = [
  {
    email: 'citizen@demo.com',
    password: 'demo123',
    name: 'John Doe',
    role: 'Citizen'
  },
  {
    email: 'officer@demo.com',
    password: 'demo123',
    name: 'Sarah Smith',
    role: 'GovernmentOfficer',
    agency: 'BirthDeaths'
  },
  {
    email: 'admin@demo.com',
    password: 'demo123',
    name: 'Admin User',
    role: 'Admin'
  }
];

const demoDocuments = [
  {
    filename: 'birth_certificate_john_doe.pdf',
    hash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    documentType: 'BirthCertificate',
    isVerified: true,
    approvalCount: 2,
    requiredApprovals: 2,
    metadata: {
      name: 'Birth Certificate - John Doe',
      description: 'Official birth certificate issued by Birth & Deaths Office'
    }
  },
  {
    filename: 'property_deed_123_main_st.pdf',
    hash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    documentType: 'PropertyDeed',
    isVerified: true,
    approvalCount: 2,
    requiredApprovals: 2,
    metadata: {
      name: 'Property Deed - 123 Main Street',
      description: 'Land registry document for residential property'
    }
  },
  {
    filename: 'bachelor_degree_computer_science.pdf',
    hash: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab',
    documentType: 'Degree',
    isVerified: false,
    approvalCount: 1,
    requiredApprovals: 2,
    metadata: {
      name: 'Bachelor of Science - Computer Science',
      description: 'University degree certificate'
    }
  }
];

async function seedDemoData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/docvault');
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing demo data...');
    await User.deleteMany({ email: { $in: demoUsers.map(u => u.email) } });
    await Document.deleteMany({ hash: { $in: demoDocuments.map(d => d.hash) } });

    // Create demo users
    console.log('👥 Creating demo users...');
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`   ✅ Created user: ${userData.email} (${userData.role})`);
    }

    // Create demo documents (associate with first citizen user)
    console.log('📄 Creating demo documents...');
    const citizenUser = createdUsers.find(u => u.role === 'Citizen');
    const officerUser = createdUsers.find(u => u.role === 'GovernmentOfficer');
    
    if (!citizenUser) {
      throw new Error('Citizen user not found');
    }

    const createdDocs = [];
    for (let i = 0; i < demoDocuments.length; i++) {
      const docData = {
        ...demoDocuments[i],
        owner: citizenUser._id,
        ownerAddress: process.env.DEFAULT_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000',
        txHash: `0x${'a'.repeat(64)}${i}`,
        fileSize: 1024 * 500, // 500KB
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${demoDocuments[i].hash}`,
        approvers: i < 2 ? [officerUser?._id].filter(Boolean) : []
      };

      const document = new Document(docData);
      await document.save();
      createdDocs.push(document);
      console.log(`   ✅ Created document: ${docData.filename} (${docData.isVerified ? 'Verified' : 'Pending'})`);
    }

    console.log('\n🎉 Demo data seeded successfully!');
    console.log('\n📋 Login Credentials:');
    demoUsers.forEach(user => {
      console.log(`   Email: ${user.email} | Password: demo123 | Role: ${user.role}`);
    });
    console.log(`\n📊 Created ${createdUsers.length} users and ${createdDocs.length} documents`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDemoData();


