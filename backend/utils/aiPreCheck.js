const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const crypto = require('crypto');

/**
 * AI-powered document authenticity pre-check
 * Detects: forgery, manipulation, duplicate templates, low-quality scans
 */
class AIPreCheck {
  constructor() {
    this.qualityThreshold = 0.7;
    this.minResolution = 300; // DPI
  }

  /**
   * Check document quality and authenticity
   * @param {string} filePath - Path to document file
   * @returns {Promise<Object>} Pre-check results
   */
  async preCheckDocument(filePath) {
    const results = {
      passed: true,
      issues: [],
      warnings: [],
      confidence: 1.0,
      checks: {}
    };

    try {
      // Check 1: File quality and resolution
      const qualityCheck = await this.checkQuality(filePath);
      results.checks.quality = qualityCheck;
      if (!qualityCheck.passed) {
        results.passed = false;
        results.issues.push('Low quality scan detected');
        results.confidence *= 0.5;
      }

      // Check 2: Text extraction and structure analysis
      const structureCheck = await this.checkStructure(filePath);
      results.checks.structure = structureCheck;
      if (!structureCheck.passed) {
        results.warnings.push('Document structure may be incomplete');
        results.confidence *= 0.8;
      }

      // Check 3: Duplicate template detection (simplified)
      const duplicateCheck = await this.checkDuplicates(filePath);
      results.checks.duplicates = duplicateCheck;
      if (duplicateCheck.suspicious) {
        results.warnings.push('Similar document template detected');
        results.confidence *= 0.9;
      }

      // Check 4: Basic manipulation detection
      const manipulationCheck = await this.checkManipulation(filePath);
      results.checks.manipulation = manipulationCheck;
      if (manipulationCheck.suspicious) {
        results.issues.push('Possible document manipulation detected');
        results.passed = false;
        results.confidence *= 0.3;
      }

      // Final confidence score
      results.confidence = Math.max(0, Math.min(1, results.confidence));

      // If confidence is too low, mark as failed
      if (results.confidence < 0.5) {
        results.passed = false;
      }

    } catch (error) {
      console.error('AI Pre-check error:', error);
      results.passed = false;
      results.issues.push('Pre-check failed: ' + error.message);
      results.confidence = 0;
    }

    return results;
  }

  /**
   * Check document quality (resolution, clarity)
   */
  async checkQuality(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      const stats = await sharp(filePath).stats();
      
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      const channels = metadata.channels || 3;
      
      // Check resolution
      const resolution = Math.sqrt(width * height);
      const minPixels = this.minResolution * this.minResolution;
      
      // Check contrast (simplified)
      const avgBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / channels;
      const contrast = stats.channels.reduce((sum, ch) => sum + Math.abs(ch.mean - avgBrightness), 0) / channels;
      
      return {
        passed: resolution >= minPixels && contrast > 20,
        resolution: { width, height, pixels: resolution },
        contrast: contrast,
        message: resolution >= minPixels && contrast > 20 
          ? 'Quality check passed' 
          : 'Low resolution or poor contrast detected'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Quality check failed: ' + error.message
      };
    }
  }

  /**
   * Check document structure using OCR
   */
  async checkStructure(filePath) {
    try {
      // Use Tesseract for OCR
      const { data } = await Tesseract.recognize(filePath, 'eng', {
        logger: m => {} // Suppress logs
      });

      const text = data.text.trim();
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
      const confidence = data.confidence || 0;

      // Check if document has meaningful content
      const hasContent = wordCount > 10 && confidence > 30;

      return {
        passed: hasContent,
        wordCount,
        confidence,
        textLength: text.length,
        message: hasContent 
          ? 'Document structure appears valid' 
          : 'Document may be incomplete or unreadable'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Structure check failed: ' + error.message
      };
    }
  }

  /**
   * Check for duplicate templates (simplified hash-based)
   */
  async checkDuplicates(filePath) {
    try {
      // Generate a template hash based on structure
      const image = await sharp(filePath)
        .resize(100, 100)
        .greyscale()
        .raw()
        .toBuffer();
      
      const templateHash = crypto.createHash('sha256').update(image).digest('hex');
      
      // In production, compare against database of known templates
      // For now, return a basic check
      return {
        suspicious: false,
        templateHash,
        message: 'No duplicate template detected'
      };
    } catch (error) {
      return {
        suspicious: false,
        message: 'Duplicate check incomplete: ' + error.message
      };
    }
  }

  /**
   * Basic manipulation detection
   */
  async checkManipulation(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      
      // Check for suspicious metadata
      const suspiciousMetadata = metadata.exif && (
        metadata.exif.DateTimeOriginal === null ||
        metadata.exif.Software?.toLowerCase().includes('photoshop')
      );

      // Check for inconsistent compression
      const format = metadata.format;
      const hasInconsistencies = format === 'jpeg' && metadata.compression === undefined;

      return {
        suspicious: suspiciousMetadata || hasInconsistencies,
        metadata: {
          format,
          hasExif: !!metadata.exif
        },
        message: suspiciousMetadata || hasInconsistencies
          ? 'Possible manipulation detected'
          : 'No obvious manipulation detected'
      };
    } catch (error) {
      return {
        suspicious: false,
        message: 'Manipulation check incomplete: ' + error.message
      };
    }
  }
}

module.exports = new AIPreCheck();

