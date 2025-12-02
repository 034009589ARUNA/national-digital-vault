const MinIO = require('minio');
const fs = require('fs');
const path = require('path');

/**
 * Storage service for encrypted document storage
 * Supports MinIO, S3, or local filesystem fallback
 */
class StorageService {
  constructor() {
    this.client = null;
    this.bucketName = process.env.STORAGE_BUCKET || 'docvault';
    this.useMinIO = process.env.USE_MINIO === 'true';
    this.useS3 = process.env.USE_S3 === 'true';
    this.useLocal = !this.useMinIO && !this.useS3;

    this.init();
  }

  async init() {
    if (this.useMinIO) {
      try {
        this.client = new MinIO.Client({
          endPoint: process.env.MINIO_ENDPOINT || 'localhost',
          port: parseInt(process.env.MINIO_PORT || '9000'),
          useSSL: process.env.MINIO_USE_SSL === 'true',
          accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
          secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        });

        // Ensure bucket exists
        const exists = await this.client.bucketExists(this.bucketName);
        if (!exists) {
          await this.client.makeBucket(this.bucketName, 'us-east-1');
        }

        console.log('MinIO storage initialized');
      } catch (error) {
        console.error('MinIO initialization error:', error);
        this.useLocal = true;
      }
    } else if (this.useS3) {
      // AWS S3 configuration
      try {
        const AWS = require('aws-sdk');
        this.s3Client = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1',
        });
        console.log('S3 storage initialized');
      } catch (error) {
        console.error('AWS SDK not installed, falling back to local storage');
        this.useLocal = true;
      }
    } else {
      // Local filesystem storage
      const uploadDir = path.join(__dirname, '../uploads/encrypted');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      console.log('Local storage initialized');
    }
  }

  /**
   * Upload file to storage
   * @param {string} filePath - Local file path
   * @param {string} objectName - Object name in storage
   * @returns {Promise<string>} Storage URL or path
   */
  async uploadFile(filePath, objectName) {
    try {
      if (this.useMinIO && this.client) {
        await this.client.fPutObject(this.bucketName, objectName, filePath);
        return `minio://${this.bucketName}/${objectName}`;
      } else if (this.useS3 && this.s3Client) {
        const fileContent = fs.readFileSync(filePath);
        await this.s3Client.putObject({
          Bucket: this.bucketName,
          Key: objectName,
          Body: fileContent,
        }).promise();
        return `s3://${this.bucketName}/${objectName}`;
      } else {
        // Local storage
        const destPath = path.join(__dirname, '../uploads/encrypted', objectName);
        fs.copyFileSync(filePath, destPath);
        return destPath;
      }
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  }

  /**
   * Download file from storage
   * @param {string} objectName - Object name in storage
   * @param {string} destPath - Destination path
   */
  async downloadFile(objectName, destPath) {
    try {
      if (this.useMinIO && this.client) {
        await this.client.fGetObject(this.bucketName, objectName, destPath);
      } else if (this.useS3 && this.s3Client) {
        const data = await this.s3Client.getObject({
          Bucket: this.bucketName,
          Key: objectName,
        }).promise();
        fs.writeFileSync(destPath, data.Body);
      } else {
        // Local storage
        const srcPath = path.join(__dirname, '../uploads/encrypted', objectName);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        } else {
          throw new Error('File not found');
        }
      }
    } catch (error) {
      console.error('Storage download error:', error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(objectName) {
    try {
      if (this.useMinIO && this.client) {
        await this.client.removeObject(this.bucketName, objectName);
      } else if (this.useS3 && this.s3Client) {
        await this.s3Client.deleteObject({
          Bucket: this.bucketName,
          Key: objectName,
        }).promise();
      } else {
        const filePath = path.join(__dirname, '../uploads/encrypted', objectName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  }

  /**
   * Get file URL (for public access if configured)
   */
  async getFileURL(objectName, expiresIn = 3600) {
    if (this.useMinIO && this.client) {
      return await this.client.presignedGetObject(this.bucketName, objectName, expiresIn);
    } else if (this.useS3 && this.s3Client) {
      return this.s3Client.getSignedUrl('getObject', {
        Bucket: this.bucketName,
        Key: objectName,
        Expires: expiresIn,
      });
    } else {
      return `/api/storage/${objectName}`;
    }
  }
}

module.exports = new StorageService();

