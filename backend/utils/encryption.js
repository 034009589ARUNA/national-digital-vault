const crypto = require('crypto');
const CryptoJS = require('crypto-js');

/**
 * AES-256 encryption utilities
 * For client-side encryption before upload
 */

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

/**
 * Generate encryption key (for client-side use)
 */
function generateKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Encrypt data with AES-256
 * @param {Buffer} data - Data to encrypt
 * @param {string} key - Encryption key (hex string)
 * @returns {Object} Encrypted data with IV
 */
function encrypt(data, key) {
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  
  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('hex')
  };
}

/**
 * Decrypt data with AES-256
 * @param {string} encryptedData - Base64 encrypted data
 * @param {string} key - Encryption key (hex string)
 * @param {string} iv - Initialization vector (hex string)
 * @returns {Buffer} Decrypted data
 */
function decrypt(encryptedData, key, iv) {
  const keyBuffer = Buffer.from(key, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedBuffer = Buffer.from(encryptedData, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  
  return decrypted;
}

/**
 * Hash IP address for privacy (SHA-256)
 */
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Client-side encryption helper (for frontend)
 * Returns JavaScript code that can be used in browser
 */
function getClientEncryptionCode() {
  return `
    // Client-side AES-256 encryption using crypto-js
    function encryptFile(file, key) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
            const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
            resolve(encrypted);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      });
    }
    
    function decryptFile(encryptedData, key) {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const wordArray = decrypted;
      return wordArray;
    }
  `;
}

module.exports = {
  generateKey,
  encrypt,
  decrypt,
  hashIP,
  getClientEncryptionCode
};

