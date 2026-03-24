import { Router } from "express";
import PDFDocument from "pdfkit";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const { image, columns = 4, rows = 2, width_mm = 35, height_mm = 45, addBleed = true } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, message: "Image data is required" });
    }

    // Strip the data URL prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    // Create a PDF document (A4 size)
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=passport-layout.pdf');
    
    doc.pipe(res);

    // 1 mm = 2.83465 PDF points
    const MM_TO_PT = 2.83465;
    
    // Grid calculation
    const imgW = width_mm * MM_TO_PT;
    const imgH = height_mm * MM_TO_PT;
    const startX = 50;
    const startY = 50;
    const gapX = 20;
    const gapY = 20;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = startX + c * (imgW + gapX);
        const y = startY + r * (imgH + gapY);
        
        doc.image(imgBuffer, x, y, { width: imgW, height: imgH });

        // Draw a light grey boundary rect for bleeding / cutting
        if (addBleed) {
          doc.lineWidth(0.5);
          doc.strokeColor('#cccccc');
          doc.rect(x - 1, y - 1, imgW + 2, imgH + 2).stroke();
        }
      }
    }

    doc.end();

  } catch (error) {
    console.error("Print generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate print layout" });
  }
});

export default router;
