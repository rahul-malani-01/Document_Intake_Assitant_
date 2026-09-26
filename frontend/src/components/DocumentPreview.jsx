import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

export function DocumentPreview({ documentText }) {
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = () => {
    if (!documentText) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    const pageHeight = doc.internal.pageSize.getHeight();

    // Document Header
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text('PERSONAL WISHES DOCUMENT', margin, margin + 10);

    // Disclaimer
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(180, 50, 50);
    doc.text('FICTIONAL – NOT LEGAL ADVICE', margin, margin + 26);

    // Document Body
    doc.setFont('courier', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);

    const splitText = doc.splitTextToSize(documentText, maxLineWidth);
    let cursorY = margin + 50;

    for (let i = 0; i < splitText.length; i++) {
      if (cursorY + 14 > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(splitText[i], margin, cursorY);
      cursorY += 14;
    }

    // Direct download trigger
    doc.save('Personal_Wishes_Document.pdf');
  };

  const handleCopy = async () => {
    if (!documentText) return;
    await navigator.clipboard.writeText(documentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h2>Live Document Preview</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="legal-banner-badge">Fictional – Not Legal Advice</span>
          <button className="btn-secondary" onClick={handleCopy} title="Copy draft text">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button
            className="btn-primary"
            onClick={handleDownloadPDF}
            disabled={!documentText}
            title="Download document as PDF"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="doc-preview-content">
        {documentText || 'Draft document preview will appear here once session initializes...'}
      </div>
    </div>
  );
}