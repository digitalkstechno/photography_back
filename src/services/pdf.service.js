import PDFDocument from "pdfkit";

class PdfService {
  async generateQuotationPdf(quotation, res) {
    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF to the response
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .text("QUOTATION", { align: "right" })
      .moveDown();

    doc
      .fontSize(10)
      .text(`Quotation #: ${quotation.quotationNumber}`, { align: "right" })
      .text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, { align: "right" })
      .moveDown();

    // Business Info (Placeholder)
    doc
      .fontSize(12)
      .text("Photography Studio", { bold: true })
      .fontSize(10)
      .text("123 Creative Street")
      .text("Art City, 56789")
      .moveDown();

    // Client Info
    doc
      .fontSize(12)
      .text("BILL TO:", { bold: true })
      .fontSize(10)
      .text(quotation.customer?.name || "N/A")
      .text(quotation.customer?.phone || "")
      .text(quotation.customer?.email || "")
      .moveDown();

    // Table Header
    const tableTop = 250;
    doc
      .fontSize(10)
      .text("Service", 50, tableTop, { bold: true })
      .text("Days", 250, tableTop, { bold: true })
      .text("Rate", 350, tableTop, { bold: true })
      .text("Total", 450, tableTop, { bold: true });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table Content
    let currentY = tableTop + 25;
    quotation.items.forEach((item) => {
      doc
        .fontSize(10)
        .text(item.name || item.service?.name || "Service", 50, currentY)
        .text(item.days.toString(), 250, currentY)
        .text(`₹${(item.pricePerDay || item.total / item.days).toFixed(2)}`, 350, currentY)
        .text(`₹${item.total.toFixed(2)}`, 450, currentY);

      currentY += 20;
    });

    // Summary
    const summaryY = currentY + 30;
    doc
      .fontSize(10)
      .text("Subtotal:", 350, summaryY)
      .text(`₹${quotation.totalAmount.toFixed(2)}`, 450, summaryY);

    if (quotation.discount > 0) {
      doc
        .text(`Discount (${quotation.discountType}):`, 350, summaryY + 20)
        .text(`-₹${(quotation.totalAmount - quotation.finalAmount).toFixed(2)}`, 450, summaryY + 20);
    }

    doc
      .text(`Tax (${quotation.taxPercent}%):`, 350, summaryY + 40)
      .text(`₹${quotation.taxAmount.toFixed(2)}`, 450, summaryY + 40);

    doc
      .fontSize(12)
      .text("GRAND TOTAL:", 350, summaryY + 65, { bold: true })
      .text(`₹${quotation.grandTotal.toFixed(2)}`, 450, summaryY + 65, { bold: true });

    // Footer
    doc
      .fontSize(10)
      .text("Terms & Conditions:", 50, summaryY + 120, { bold: true })
      .text(quotation.terms || "Standard studio terms apply.", 50, summaryY + 135, { width: 500 });

    doc.end();
  }
}

export const pdfService = new PdfService();
