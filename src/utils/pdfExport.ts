import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { PaperSize } from '../types/bill';

/**
 * Generates a crisp single-page 5 x 7 inch PDF from the fitted #printable-5x7-sheet DOM node.
 * Uses browser-native SVG foreignObject capture via html-to-image so
 * Urdu RTL ligatures and Jameel Noori Nastaleeq shaping are preserved accurately.
 */
export async function downloadInvoicePdf(
  element: HTMLElement,
  billNumber: string,
  _paperSize: PaperSize = '5x7'
): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Wait for all embedded tent photographs inside the invoice to finish loading
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(async (imgEl) => {
      if (!imgEl.complete) {
        await new Promise<void>((resolve) => {
          imgEl.addEventListener('load', () => resolve(), { once: true });
          imgEl.addEventListener('error', () => resolve(), { once: true });
        });
      }
      if (typeof imgEl.decode === 'function') {
        try {
          await imgEl.decode();
        } catch {
          // Ignore decode failures; fallback or partial render handled safely
        }
      }
    })
  );

  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 3,
    backgroundColor: '#ffffff',
    style: {
      margin: '0',
      boxShadow: 'none',
      position: 'relative',
      left: '0',
      top: '0',
      opacity: '1',
      visibility: 'visible',
    },
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to render invoice image for PDF'));
  });

  // Exact 5 inches wide x 7 inches high portrait single-page PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [5, 7],
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 5 in
  const pageHeight = pdf.internal.pageSize.getHeight(); // 7 in

  // #printable-5x7-sheet already includes its own balanced internal page margins (0.13in/0.15in)
  const imgRatio = img.width / img.height;
  let renderWidth = pageWidth;
  let renderHeight = renderWidth / imgRatio;

  if (renderHeight > pageHeight) {
    renderHeight = pageHeight;
    renderWidth = renderHeight * imgRatio;
  }

  const offsetX = (pageWidth - renderWidth) / 2;
  const offsetY = (pageHeight - renderHeight) / 2;

  pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');

  const safeFileNum = (billNumber || 'Invoice').replace(/[^\w\u0600-\u06FF-]+/g, '_');
  pdf.save(`Lajpal_Tent_Bill_5x7_${safeFileNum}.pdf`);
}
