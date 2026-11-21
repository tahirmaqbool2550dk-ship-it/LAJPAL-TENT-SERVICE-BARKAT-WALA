import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { PaperSize } from '../types/bill';

/**
 * Generates a crisp PDF from the rendered #printable-invoice DOM node.
 * Uses browser-native SVG foreignObject capture via html-to-image so
 * Urdu RTL ligatures and Jameel Noori Nastaleeq shaping are preserved accurately.
 */
export async function downloadInvoicePdf(
  element: HTMLElement,
  billNumber: string,
  paperSize: PaperSize
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
    pixelRatio: 2.5,
    backgroundColor: '#ffffff',
    style: {
      margin: '0',
      boxShadow: 'none',
    },
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to render invoice image for PDF'));
  });

  // A4 = 210mm x 297mm, Half-A4 (A5) = 148mm x 210mm
  const format: [number, number] = paperSize === 'half-a4' ? [148, 210] : [210, 297];
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format,
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = paperSize === 'half-a4' ? 6 : 10;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  const imgRatio = img.width / img.height;
  let renderWidth = maxWidth;
  let renderHeight = renderWidth / imgRatio;

  if (renderHeight > maxHeight) {
    renderHeight = maxHeight;
    renderWidth = renderHeight * imgRatio;
  }

  const offsetX = (pageWidth - renderWidth) / 2;
  const offsetY = margin;

  pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');

  const safeFileNum = (billNumber || 'Invoice').replace(/[^\w\u0600-\u06FF-]+/g, '_');
  pdf.save(`Lajpal_Tent_Bill_${safeFileNum}.pdf`);
}
