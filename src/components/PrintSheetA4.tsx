import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Bill } from '../types/bill';
import {
  calculateBillTotals,
  calculateItemTotal,
  formatCurrency,
  formatDisplayDate,
} from '../utils/billing';

export interface FitMetrics {
  tier: 0 | 1 | 2 | 3;
  scale: number;
}

export interface PrintSheetA4Handle {
  fitNow: () => void;
}

interface PrintSheetA4Props {
  bill: Bill;
  sheetRef: React.RefObject<HTMLDivElement | null>;
  controllerRef?: React.RefObject<PrintSheetA4Handle | null>;
  onFitChange?: (metrics: FitMetrics) => void;
}

const PrintHeaderPhoto: React.FC<{
  src: string;
  alt: string;
}> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="pa4-photo-box">
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="eager"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center px-2 text-center font-urdu"
          style={{ color: '#F5D076', fontSize: '11px' }}
        >
          {alt}
        </div>
      )}
    </div>
  );
};

export const PrintSheetA4: React.FC<PrintSheetA4Props> = ({
  bill,
  sheetRef,
  controllerRef,
  onFitChange,
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const totals = calculateBillTotals(bill.items, bill.receivedAmount);

  const fitToPage = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const targetW = viewport.clientWidth || 722;
    const targetH = viewport.clientHeight || 1056;
    const safeW = Math.max(200, targetW - 2);
    const safeH = Math.max(200, targetH - 6);

    // Reset inline sizing/transform before testing progressive density tiers
    content.style.transform = 'none';
    content.style.transformOrigin = 'top left';
    content.style.width = `${targetW}px`;

    // Pass 1: Try progressive density tiers 0 -> 1 -> 2 -> 3 at native 1:1 scale
    for (const tier of [0, 1, 2, 3] as const) {
      content.setAttribute('data-tier', String(tier));
      const measuredH = content.scrollHeight;
      const measuredW = content.scrollWidth;
      if (measuredH <= safeH && measuredW <= targetW) {
        onFitChange?.({ tier, scale: 1 });
        return;
      }
    }

    // Pass 2: Even Tier 3 overflows A4 at 1:1 -> keep Tier 3 and proportionally scale to fit 1 A4 page
    content.setAttribute('data-tier', '3');
    let measuredH = content.scrollHeight;
    let measuredW = content.scrollWidth;

    let scale = Math.min(1, Math.sqrt(safeH / Math.max(measuredH, 1)));
    scale = Math.max(0.15, scale);

    for (let pass = 0; pass < 5; pass++) {
      const candidateW = Math.max(targetW, Math.floor(safeW / scale));
      content.style.width = `${candidateW}px`;
      measuredH = content.scrollHeight;
      measuredW = content.scrollWidth;

      const scaleY = safeH / Math.max(measuredH, 1);
      const scaleX = safeW / Math.max(measuredW, candidateW);
      const nextScale = Math.min(1, scaleY, scaleX);

      if (
        measuredH * nextScale <= safeH &&
        measuredW * nextScale <= safeW &&
        Math.abs(nextScale - scale) < 0.005
      ) {
        scale = nextScale;
        break;
      }

      scale = pass === 4 ? nextScale * 0.99 : Math.max(0.12, (scale + nextScale) / 2);
    }

    const finalUnscaledW = Math.max(targetW, Math.floor(safeW / Math.max(scale, 0.1)));
    content.style.width = `${finalUnscaledW}px`;
    const finalH = content.scrollHeight;
    const finalW = content.scrollWidth;
    const finalScale = Math.min(
      1,
      (safeH - 2) / Math.max(finalH, 1),
      (safeW - 1) / Math.max(finalW, 1)
    );

    content.style.transformOrigin = 'top left';
    content.style.transform = `scale(${finalScale})`;
    onFitChange?.({ tier: 3, scale: finalScale });
  }, [onFitChange]);

  useImperativeHandle(
    controllerRef,
    () => ({
      fitNow: fitToPage,
    }),
    [fitToPage]
  );

  // Refit synchronously whenever bill contents change
  useLayoutEffect(() => {
    fitToPage();
  }, [bill, fitToPage]);

  // Refit when custom Urdu fonts finish loading and right before browser prints (e.g., Ctrl+P)
  useEffect(() => {
    let active = true;
    const handleRefit = () => {
      if (active) fitToPage();
    };

    if (typeof document !== 'undefined' && 'fonts' in document) {
      void document.fonts.ready.then(handleRefit);
      document.fonts.addEventListener?.('loadingdone', handleRefit);
    }
    window.addEventListener('beforeprint', handleRefit);

    return () => {
      active = false;
      if (typeof document !== 'undefined' && 'fonts' in document) {
        document.fonts.removeEventListener?.('loadingdone', handleRefit);
      }
      window.removeEventListener('beforeprint', handleRefit);
    };
  }, [fitToPage]);

  return (
    <div className="print-a4-wrapper" aria-hidden="true">
      <div
        id="printable-a4-sheet"
        ref={sheetRef}
        dir="rtl"
        className="pa4-sheet"
        style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
      >
        <div ref={viewportRef} className="pa4-viewport">
          <div ref={contentRef} data-tier="0" dir="rtl" className="pa4-content">
            {/* Letterhead Header */}
            <div className="pa4-header-wrap" style={{ borderColor: '#0B1F3A' }}>
              <div
                className="pa4-banner"
                style={{
                  backgroundColor: '#0B1F3A',
                  color: '#ffffff',
                  borderBottom: '3px solid #C89B3C',
                }}
              >
                {/* Top Tent & Marquee Photographs */}
                <div className="pa4-photos-grid">
                  <PrintHeaderPhoto
                    src="/src/assets/images/pakistani_tent_canopy_1795234895117.jpg"
                    alt="لجپال ٹینٹ سروس برکت والا - شامیانہ اور ٹینٹ انتظام"
                  />
                  <PrintHeaderPhoto
                    src="/src/assets/images/marquee_tent_interior_1795234895605.jpg"
                    alt="لجپال ٹینٹ سروس برکت والا - مارکی ٹینٹ اور تقریب کا انتظام"
                  />
                </div>

                <p
                  dir="ltr"
                  className="pa4-en-title font-latin font-extrabold uppercase"
                  style={{ color: '#F5D076' }}
                >
                  LAJPAL TENT SERVICE BARKAT WALA
                </p>
                <h2 className="pa4-ur-title font-urdu font-bold" style={{ color: '#ffffff' }}>
                  لجپال ٹینٹ سروس برکت والا
                </h2>

                <p dir="rtl" className="pa4-desc font-urdu" style={{ color: '#e2e8f0' }}>
                  شادی بیاہ، ولیمہ، محافل اور ہر قسم کی تقریبات کے لیے معیاری ٹینٹ، شامیانہ، مارکی، کرسیاں، میزیں اور قالین کی مکمل سروس
                </p>

                <div
                  dir="ltr"
                  className="pa4-contacts"
                  style={{ borderColor: 'rgba(255,255,255,0.18)' }}
                >
                  <p className="font-latin font-semibold tracking-wide" style={{ color: '#F5D076' }}>
                    Maqbool Ahmad:{' '}
                    <span className="font-num font-bold" style={{ color: '#ffffff' }}>
                      0301-3927492
                    </span>
                  </p>
                  <p
                    className="inline-flex items-center justify-center gap-1.5 font-latin font-semibold tracking-wide"
                    style={{ color: '#F5D076' }}
                  >
                    <svg
                      viewBox="0 0 32 32"
                      className="pa4-wa-icon shrink-0"
                      aria-label="WhatsApp"
                      role="img"
                    >
                      <circle cx="16" cy="16" r="16" fill="#25D366" />
                      <path
                        fill="#FFFFFF"
                        d="M23.5 19.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.5-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"
                      />
                    </svg>
                    <span>
                      Tahir Maqbool:{' '}
                      <span className="font-num font-bold" style={{ color: '#ffffff' }}>
                        0305-6359218
                      </span>
                    </span>
                  </p>
                </div>
              </div>

              <div className="pa4-subhead-bar">
                <span className="pa4-subhead-title font-urdu font-bold" style={{ color: '#0B1F3A' }}>
                  کمپیوٹرائزڈ کرایہ بل / انوائس
                </span>
              </div>
            </div>

            {/* Bill & Customer Information — Original 6-Row Order (Full Text Preserved) */}
            <div className="pa4-info-list" style={{ borderColor: '#cbd5e1' }}>
              <div className="pa4-info-row" style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}>
                <span className="pa4-info-label font-urdu font-bold" style={{ color: '#0B1F3A' }}>
                  گاہک کا نام:
                </span>
                <span className="pa4-info-val font-urdu font-semibold" style={{ color: '#0f172a' }}>
                  {bill.customerName.trim() || '—'}
                </span>
              </div>

              <div className="pa4-info-row" style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}>
                <span className="pa4-info-label font-urdu font-bold" style={{ color: '#0B1F3A' }}>
                  موبائل نمبر:
                </span>
                <span dir="ltr" className="pa4-info-val font-num font-semibold" style={{ color: '#0f172a' }}>
                  {bill.mobileNumber.trim() || '—'}
                </span>
              </div>

              <div className="pa4-info-row" style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}>
                <span className="pa4-info-label font-urdu font-bold" style={{ color: '#0B1F3A' }}>
                  تاریخ:
                </span>
                <span dir="ltr" className="pa4-info-val font-num font-semibold" style={{ color: '#0f172a' }}>
                  {formatDisplayDate(bill.date)}
                </span>
              </div>

              <div className="pa4-info-row" style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}>
                <span className="pa4-info-label font-urdu font-bold" style={{ color: '#0B1F3A' }}>
                  تقریب کی تاریخ:
                </span>
                <span dir="ltr" className="pa4-info-val font-num font-semibold" style={{ color: '#0f172a' }}>
                  {formatDisplayDate(bill.eventDate)}
                </span>
              </div>

              <div className="pa4-info-row" style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}>
                <span className="pa4-info-label font-urdu font-bold" style={{ color: '#0B1F3A' }}>
                  تقریب کا مقام:
                </span>
                <span className="pa4-info-val font-urdu font-semibold" style={{ color: '#0f172a' }}>
                  {bill.eventVenue.trim() || '—'}
                </span>
              </div>

              <div className="pa4-info-row pa4-info-row-last" style={{ backgroundColor: '#ffffff' }}>
                <span className="pa4-info-label font-urdu font-bold" style={{ color: '#0B1F3A' }}>
                  بل نمبر:
                </span>
                <span dir="ltr" className="pa4-info-val font-num font-bold" style={{ color: '#0B1F3A' }}>
                  {bill.billNumber || '—'}
                </span>
              </div>
            </div>

            {/* Itemized Tent Rental Table */}
            <div className="pa4-table-wrap">
              <table className="pa4-table border-collapse border" style={{ borderColor: '#94a3b8' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0B1F3A', color: '#ffffff' }}>
                    <th className="pa4-th pa4-col-idx border font-urdu font-bold text-center" style={{ borderColor: '#1e3a5f' }}>
                      نمبر
                    </th>
                    <th className="pa4-th border font-urdu font-bold text-right" style={{ borderColor: '#1e3a5f' }}>
                      سامان کا نام
                    </th>
                    <th className="pa4-th pa4-col-qty border font-urdu font-bold text-center" style={{ borderColor: '#1e3a5f' }}>
                      تعداد
                    </th>
                    <th className="pa4-th pa4-col-rate border font-urdu font-bold text-left" style={{ borderColor: '#1e3a5f' }}>
                      فی آئٹم ریٹ
                    </th>
                    <th className="pa4-th pa4-col-total border font-urdu font-bold text-left" style={{ borderColor: '#1e3a5f' }}>
                      کل رقم
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="pa4-td border text-center font-urdu"
                        style={{ borderColor: '#cbd5e1', color: '#64748b' }}
                      >
                        کوئی سامان درج نہیں کیا گیا
                      </td>
                    </tr>
                  ) : (
                    bill.items.map((item, idx) => {
                      const lineTotal = calculateItemTotal(item.quantity, item.rate);
                      const qtyDisplay = item.quantity === '' ? 0 : item.quantity;
                      const rateDisplay = item.rate === '' ? 0 : item.rate;
                      return (
                        <tr
                          key={item.id}
                          style={{
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          }}
                        >
                          <td
                            className="pa4-td border text-center font-num"
                            style={{ borderColor: '#cbd5e1', color: '#475569' }}
                          >
                            {idx + 1}
                          </td>
                          <td
                            className="pa4-td pa4-item-name border font-urdu text-right"
                            style={{ borderColor: '#cbd5e1', color: '#0f172a' }}
                          >
                            {item.name.trim() || '—'}
                          </td>
                          <td
                            dir="ltr"
                            className="pa4-td border text-center font-num font-semibold"
                            style={{ borderColor: '#cbd5e1', color: '#0f172a' }}
                          >
                            {qtyDisplay}
                          </td>
                          <td
                            dir="ltr"
                            className="pa4-td border text-left font-num"
                            style={{ borderColor: '#cbd5e1', color: '#0f172a' }}
                          >
                            {formatCurrency(Number(rateDisplay))}
                          </td>
                          <td
                            dir="ltr"
                            className="pa4-td border text-left font-num font-bold"
                            style={{ borderColor: '#cbd5e1', color: '#0B1F3A' }}
                          >
                            {formatCurrency(lineTotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown — Original Right-Aligned Card */}
            <div className="pa4-totals-wrap">
              <div className="pa4-totals-box border rounded-md" style={{ borderColor: '#94a3b8' }}>
                <div
                  className="pa4-total-line border-b"
                  style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }}
                >
                  <span className="font-urdu font-bold" style={{ color: '#0B1F3A' }}>
                    کل بل:
                  </span>
                  <span dir="ltr" className="font-num font-bold" style={{ color: '#0B1F3A' }}>
                    Rs. {formatCurrency(totals.grandTotal)}
                  </span>
                </div>

                <div
                  className="pa4-total-line border-b"
                  style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}
                >
                  <span className="font-urdu font-bold" style={{ color: '#0F6B43' }}>
                    وصول شدہ رقم:
                  </span>
                  <span dir="ltr" className="font-num font-bold" style={{ color: '#0F6B43' }}>
                    Rs. {formatCurrency(totals.receivedAmount)}
                  </span>
                </div>

                <div
                  className="pa4-total-line pa4-total-balance"
                  style={{
                    backgroundColor: totals.remainingBalance > 0 ? '#FEF3C7' : '#ECFDF5',
                    borderTop: '2px solid #0B1F3A',
                  }}
                >
                  <span
                    className="font-urdu font-bold"
                    style={{
                      color: totals.remainingBalance > 0 ? '#92400E' : '#065F46',
                    }}
                  >
                    بقایا رقم:
                  </span>
                  <span
                    dir="ltr"
                    className="pa4-balance-val font-num font-extrabold"
                    style={{
                      color: totals.remainingBalance > 0 ? '#92400E' : '#065F46',
                    }}
                  >
                    Rs. {formatCurrency(totals.remainingBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer & Official Green Business Stamp — Original Layout */}
            <div className="pa4-footer-wrap border-t" style={{ borderColor: '#cbd5e1' }}>
              <div className="pa4-sign-block">
                <p className="pa4-thanks font-urdu font-bold" style={{ color: '#0B1F3A' }}>
                  آپ کے اعتماد کا شکریہ!
                </p>
                <div className="pa4-sign-line-wrap">
                  <div
                    className="pa4-sign-line border-b border-dashed"
                    style={{ borderColor: '#64748b' }}
                  />
                  <span className="pa4-sign-label font-urdu" style={{ color: '#475569' }}>
                    دستخط / مہر انچارج
                  </span>
                </div>
              </div>

              <div
                className="urdu-official-stamp pa4-stamp rounded-lg text-center"
                style={{
                  borderColor: '#0F6B43',
                  color: '#0F6B43',
                  backgroundColor: '#F0FDF4',
                }}
              >
                <p className="pa4-stamp-title font-urdu font-bold">لجپال ٹینٹ سروس</p>
                <p className="pa4-stamp-sub font-urdu font-bold">برکت والا</p>
                <p className="pa4-stamp-phone font-urdu font-semibold">
                  رابطہ نمبر:{' '}
                  <span dir="ltr" className="font-num font-bold">
                    0301-3927492
                  </span>
                </p>
              </div>
            </div>

            {/* Bottom Important Rental Terms & Conditions */}
            <div
              dir="rtl"
              className="pa4-terms rounded-md border text-right"
              style={{
                borderColor: '#0B1F3A',
                backgroundColor: '#f8fafc',
              }}
            >
              <h3
                className="pa4-terms-title font-urdu font-bold border-b"
                style={{ color: '#0B1F3A', borderColor: '#cbd5e1' }}
              >
                ضروری ہدایات و شرائط
              </h3>
              <ol className="pa4-terms-list font-urdu" style={{ color: '#0f172a' }}>
                <li>1. سامان گم یا کم ہونے کی صورت میں کلائنٹ خود ذمہ دار ہوگا۔</li>
                <li>2. سامان پروگرام ختم ہونے کے فوراً بعد واپس کرنا ہوگا، بصورتِ دیگر اگلے دن کا کرایہ بھی وصول کیا جائے گا۔</li>
              </ol>
            </div>

            {/* Bottom Footer Text */}
            <div
              dir="ltr"
              className="pa4-bottom-footer font-latin font-extrabold uppercase text-center"
              style={{ color: '#0B1F3A', borderColor: '#cbd5e1' }}
            >
              LAJPAL TENT SERVICE COMPUTRIZED BILLING SYSTEM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
