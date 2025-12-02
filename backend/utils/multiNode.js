const axios = require('axios');

/**
 * Multi-node synchronization utility
 * For decentralized backup and redundancy
 */
class MultiNodeSync {
  constructor() {
    this.backupNodes = process.env.BACKUP_NODES ? process.env.BACKUP_NODES.split(',') : [];
    this.syncEnabled = process.env.ENABLE_NODE_SYNC === 'true';
  }

  /**
   * Sync document to backup nodes
   */
  async syncDocument(documentData) {
    if (!this.syncEnabled || this.backupNodes.length === 0) {
      return { synced: false, message: 'Node sync disabled or no backup nodes' };
    }

    const syncResults = [];
    
    for (const nodeUrl of this.backupNodes) {
      try {
        const response = await axios.post(`${nodeUrl}/api/sync/document`, documentData, {
          timeout: 5000,
          headers: {
            'X-Sync-Node': process.env.NODE_ID || 'node-1',
            'X-Sync-Key': process.env.SYNC_KEY || 'default-sync-key'
          }
        });
        syncResults.push({ node: nodeUrl, status: 'success', data: response.data });
      } catch (error) {
        syncResults.push({ node: nodeUrl, status: 'failed', error: error.message });
      }
    }

    return {
      synced: syncResults.some(r => r.status === 'success'),
      results: syncResults
    };
  }

  /**
   * Get document from any available node
   */
  async getDocumentFromNodes(documentHash) {
    // Try current node first
    // Then try backup nodes
    for (const nodeUrl of this.backupNodes) {
      try {
        const response = await axios.get(`${nodeUrl}/api/documents/hash/${documentHash}`, {
          timeout: 5000
        });
        if (response.data.document) {
          return { source: nodeUrl, document: response.data.document };
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  /**
   * Health check all nodes
   */
  async checkNodeHealth() {
    const healthChecks = [];
    
    for (const nodeUrl of this.backupNodes) {
      try {
        const response = await axios.get(`${nodeUrl}/api/health`, { timeout: 3000 });
        healthChecks.push({
          node: nodeUrl,
          status: 'healthy',
          data: response.data
        });
      } catch (error) {
        healthChecks.push({
          node: nodeUrl,
          status: 'unhealthy',
          error: error.message
        });
      }
    }

    return healthChecks;
  }
}

module.exports = new MultiNodeSync();

