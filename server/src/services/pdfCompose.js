import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function composePagesToPDF(pageImageBuffers, { watermark = "Zeroth Wonder" } = {}) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const imgBuffer of pageImageBuffers) {
    const isPng = imgBuffer[0] === 0x89 && imgBuffer[1] === 0x50;
    const image = isPng ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);

    const pageWidth = 850;
    const pageHeight = (image.height / image.width) * pageWidth;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    page.drawImage(image, { x: 0, y: 0, width: pageWidth, height: pageHeight });

    const fontSize = 12;
    const textWidth = font.widthOfTextAtSize(watermark, fontSize);
    page.drawText(watermark, {
      x: pageWidth / 2 - textWidth / 2,
      y: 14,
      size: fontSize,
      font,
      color: rgb(0.95, 0.9, 0.81),
      opacity: 0.85,
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}