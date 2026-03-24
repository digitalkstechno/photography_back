import { Router } from "express";
import PDFDocument from "pdfkit";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const { image } = req.body;
    
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

    // 4 columns, 2 rows grid calculation
    const columns = 4;
    const rows = 2;
    const imgW = 100;
    const imgH = 128;
    const startX = 50;
    const startY = 50;
    const gapX = 20;
    const gapY = 20;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = startX + c * (imgW + gapX);
        const y = startY + r * (imgH + gapY);
        doc.image(imgBuffer, x, y, { width: imgW, height: imgH });
      }
    }

    doc.end();

  } catch (error) {
    console.error("Print generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate print layout" });
  }
});

export default router;
