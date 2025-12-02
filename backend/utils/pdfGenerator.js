const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

/**
 * Generate verifiable PDF certificate for verified documents
 */
class PDFGenerator {
  constructor() {
    this.certificateTemplate = {
      title: 'Document Verification Certificate',
      issuer: 'National Digital Document Vault',
      borderColor: rgb(0.2, 0.4, 0.8),
      textColor: rgb(0.1, 0.1, 0.1)
    };
  }

  /**
   * Generate PDF certificate
   * @param {Object} documentData - Document information
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateCertificate(documentData) {
    const {
      documentHash,
      transactionHash,
      documentType,
      ownerName,
      timestamp,
      verificationUrl,
      isVerified,
      approvalCount,
      requiredApprovals
    } = documentData;

    // Create new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Draw border
    page.drawRectangle({
      x: 50,
      y: 50,
      width: width - 100,
      height: height - 100,
      borderColor: this.certificateTemplate.borderColor,
      borderWidth: 2,
    });

    // Title
    page.drawText(this.certificateTemplate.title, {
      x: width / 2 - 120,
      y: height - 100,
      size: 24,
      font: helveticaBoldFont,
      color: this.certificateTemplate.borderColor,
    });

    // Issuer
    page.drawText(this.certificateTemplate.issuer, {
      x: width / 2 - 100,
      y: height - 130,
      size: 14,
      font: helveticaFont,
      color: this.certificateTemplate.textColor,
    });

    let yPos = height - 200;

    // Document Information
    page.drawText('Document Information:', {
      x: 80,
      y: yPos,
      size: 16,
      font: helveticaBoldFont,
      color: this.certificateTemplate.textColor,
    });

    yPos -= 30;

    const infoFields = [
      { label: 'Document Type:', value: documentType || 'Official Document' },
      { label: 'Owner Name:', value: ownerName || 'N/A' },
      { label: 'Verification Status:', value: isVerified ? 'VERIFIED ✓' : 'PENDING' },
      { label: 'Timestamp:', value: new Date(timestamp).toLocaleString() },
    ];

    infoFields.forEach(field => {
      page.drawText(field.label, {
        x: 80,
        y: yPos,
        size: 12,
        font: helveticaBoldFont,
        color: this.certificateTemplate.textColor,
      });
      page.drawText(field.value, {
        x: 250,
        y: yPos,
        size: 12,
        font: helveticaFont,
        color: this.certificateTemplate.textColor,
      });
      yPos -= 25;
    });

    // Blockchain Information
    yPos -= 20;
    page.drawText('Blockchain Information:', {
      x: 80,
      y: yPos,
      size: 16,
      font: helveticaBoldFont,
      color: this.certificateTemplate.textColor,
    });

    yPos -= 30;

    const blockchainFields = [
      { label: 'Document Hash:', value: documentHash.substring(0, 20) + '...' },
      { label: 'Transaction Hash:', value: transactionHash.substring(0, 20) + '...' },
    ];

    if (requiredApprovals > 0) {
      blockchainFields.push({
        label: 'Approvals:',
        value: `${approvalCount} / ${requiredApprovals}`
      });
    }

    blockchainFields.forEach(field => {
      page.drawText(field.label, {
        x: 80,
        y: yPos,
        size: 12,
        font: helveticaBoldFont,
        color: this.certificateTemplate.textColor,
      });
      page.drawText(field.value, {
        x: 250,
        y: yPos,
        size: 10,
        font: helveticaFont,
        color: this.certificateTemplate.textColor,
      });
      yPos -= 25;
    });

    // Full hashes (smaller font)
    yPos -= 20;
    page.drawText('Full Document Hash:', {
      x: 80,
      y: yPos,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 15;
    page.drawText(documentHash, {
      x: 80,
      y: yPos,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    yPos -= 20;
    page.drawText('Full Transaction Hash:', {
      x: 80,
      y: yPos,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 15;
    page.drawText(transactionHash, {
      x: 80,
      y: yPos,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Generate QR Code
    try {
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 1
      });

      // Embed QR code image
      const qrImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      const qrDims = qrImage.scale(0.5);

      page.drawImage(qrImage, {
        x: width - 250,
        y: 150,
        width: qrDims.width,
        height: qrDims.height,
      });

      page.drawText('Scan to Verify', {
        x: width - 200,
        y: 130,
        size: 10,
        font: helveticaFont,
        color: this.certificateTemplate.textColor,
      });
    } catch (error) {
      console.error('QR code generation error:', error);
    }

    // Footer
    page.drawText('This certificate is generated by the National Digital Document Vault', {
      x: width / 2 - 180,
      y: 80,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Save PDF to file
   */
  async saveCertificate(documentData, outputPath) {
    const pdfBuffer = await this.generateCertificate(documentData);
    fs.writeFileSync(outputPath, pdfBuffer);
    return outputPath;
  }
}

module.exports = new PDFGenerator();

